
// Intelligent Cleanup Engine — suggest + validate + apply (safe write-back)
import { maskPII } from '../pii.js';
import { auditLog } from '../audit.js';
import { applyWritebackIfPermitted } from './writebackPolicy.js';
import sqlite3 from 'sqlite3';
import path from 'path';
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');

function withDb(cb){ const db=new sqlite3.Database(DB_PATH); db.serialize(()=>cb(db)); db.close(); }

// Simple normalizers
function normalizePhone(p){ if(!p) return null; const d = String(p).replace(/\D/g,''); if(d.length<7) return null; return '+'+d; }
function normalizeDate(s){ if(!s) return null; const d = new Date(s); if(!isNaN(d.getTime())) return d.toISOString().slice(0,10); return null; }
function normalizeName(n){ if(!n) return null; return String(n).replace(/\s+/g,' ').trim().replace(/\b\w/g,c=>c.toUpperCase()); }
function inferIndustry(r){ // heuristic based on keywords
  const txt = ((r.website||'')+' '+(r.description||'')+' '+(r.naics||'')).toLowerCase();
  if(/hospital|clinic|pharma|health/.test(txt)) return 'Healthcare';
  if(/bank|fintech|loan|insur/.test(txt)) return 'Financial Services';
  if(/retail|ecommerce|shop/.test(txt)) return 'Retail';
  if(/university|school|edu/.test(txt)) return 'Education';
  return null;
}
function badBusinessRule(r){ // e.g., large deals shouldn’t have 10% probability
  const amt = Number(r.amount||0); const prob = Number(r.probability||0);
  if(amt>=500000 && prob <= 0.1) return { field:'probability', suggested: 0.6, why:'Large deal with improbably low close probability' };
  return null;
}

// Fuzzy dedupe via email/phone keys (safe deterministic)
function dedupeKey(r){ return (r.email?.toLowerCase()) || normalizePhone(r.phone) || (r.name?.toLowerCase()); }

export function suggestCleanup(records=[], source='unknown', user_email='system'){
  const suggestions = [];
  const seen = new Map();
  records.forEach((r, idx)=>{
    const before = { ...r };
    const after = { ...r };
    const why = [];

    // Standardize
    const p = normalizePhone(r.phone);
    if(p && p!==r.phone){ after.phone = p; why.push('Standardized phone'); }
    const d = normalizeDate(r.date||r.created_at||r.updated_at);
    if(d && d !== r.date){ after.date = d; why.push('Standardized date'); }
    const nm = normalizeName(r.name);
    if(nm && nm !== r.name){ after.name = nm; why.push('Standardized name'); }

    // Infer
    if(!r.industry){ const ind = inferIndustry(r); if(ind){ after.industry = ind; why.push('Inferred industry'); } }

    // Business rule validations
    const br = badBusinessRule(r); if(br){ after[br.field]=br.suggested; why.push(br.why); }

    // Dedupe
    const key = dedupeKey(r);
    if(key){
      if(seen.has(key)){
        after._dedupeWith = seen.get(key);
        why.push('Potential duplicate by key '+key);
      } else {
        seen.set(key, r.id || idx);
      }
    }

    // Confidence heuristic: proportion of changes
    const changed = Object.keys(after).filter(k=>JSON.stringify(after[k])!==JSON.stringify(before[k]));
    const confidence = Math.min(0.99, Math.max(0.5, changed.length / Math.max(1,Object.keys(before).length)));
    if(changed.length>0){
      suggestions.push({
        id: `sugg_${Date.now()}_${idx}`,
        source,
        before: maskPII(before),
        after: maskPII(after),
        why,
        confidence
      });
    }
  });

  // Persist in queue table
  withDb(db=>{
    db.run(`CREATE TABLE IF NOT EXISTS data_quality_queue(
      id TEXT PRIMARY KEY,
      user_id TEXT, source TEXT, payload_json TEXT, confidence REAL,
      status TEXT, created_at TEXT DEFAULT (datetime('now'))
    )`);
    const stmt = db.prepare(`INSERT OR REPLACE INTO data_quality_queue(id,user_id,source,payload_json,confidence,status) VALUES(?,?,?,?,?,?)`);
    suggestions.forEach(s => stmt.run([s.id, user_email, s.source, JSON.stringify(s), s.confidence, 'pending']));
    stmt.finalize();
  });

  return suggestions;
}

export function approveSuggestions(ids=[], user, options={}){
  const applied = [], failed = [];
  withDb(db=>{
    db.run(`CREATE TABLE IF NOT EXISTS data_quality_changes(
      id TEXT PRIMARY KEY, source TEXT, before_json TEXT, after_json TEXT,
      applied_by TEXT, applied_at TEXT DEFAULT (datetime('now')), confidence REAL)`);

    db.serialize(()=>{
      ids.forEach(id=>{
        db.get(`SELECT payload_json, confidence, status FROM data_quality_queue WHERE id=?`, [id], (e,row)=>{
          if(e || !row){ failed.push({id, reason:'not_found'}); return; }
          const payload = JSON.parse(row.payload_json||'{}');
          const decision = applyWritebackIfPermitted(payload, user);
          if(!decision.allowed){
            failed.push({id, reason: decision.reason||'policy_denied'});
            db.run(`UPDATE data_quality_queue SET status=? WHERE id=?`, ['denied', id]);
            return;
          }
          // Simulate write-back by inserting into changes table; real connector write is handled elsewhere
          db.run(`INSERT OR REPLACE INTO data_quality_changes(id, source, before_json, after_json, applied_by, confidence) VALUES(?,?,?,?,?,?)`,
            [id, payload.source||'unknown', JSON.stringify(payload.before||{}), JSON.stringify(payload.after||{}), user?.email||'system', row.confidence||0], (ee)=>{
              if(ee){ failed.push({id, reason:'db_error'}); return; }
              db.run(`UPDATE data_quality_queue SET status=? WHERE id=?`, ['applied', id]);
              applied.push(id);
              auditLog({ user_email: user?.email||'system', action: 'data_quality_apply', details: { id, source: payload.source, confidence: row.confidence } });
            });
        });
      });
    });
  });
  return { applied, failed };
}

export function listQueue(statuses=['pending','failed'], limit=100){
  return new Promise(resolve=>{
    withDb(db=>{
      const q = `SELECT * FROM data_quality_queue WHERE status IN (${statuses.map(()=>'?').join(',')}) ORDER BY created_at DESC LIMIT ?`;
      db.all(q, [...statuses, limit], (e, rows)=>{
        resolve((rows||[]).map(r=>({ id:r.id, source:r.source, confidence:r.confidence, status:r.status, payload: JSON.parse(r.payload_json||'{}'), created_at:r.created_at })));
      });
    });
  });
}
export default { suggestCleanup, approveSuggestions, listQueue };
