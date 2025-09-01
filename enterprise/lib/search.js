import { searchReqTotal, searchErrTotal, searchLatencyP95 } from './metrics/registry.js';
import { getRegistry } from './metrics/registry.js';
import { wbSearchReqTotal, wbSearchErrTotal, wbSearchLatencyP95Ms } from './metrics/registry.js';
/**
 * lib/search.js
 * Full-text search over signals using SQLite FTS5.
 * Fields: ts, type, title, entityId, accountId, payload_json
 * Defensive: wraps all operations in try/catch and tolerates missing FTS5.
 */
import sqlite3 from 'sqlite3';
import path from 'path';
import { logJson } from './logger.js';

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');
const BREAKER = (process.env.WB_FEATURE_SEARCH_BREAKER||'').toLowerCase()==='true';

// Metrics (registered on default registry)
const searchReq = new client.Counter({ name:'wb_search_req_total', help:'Total search requests' });
const searchErr = new client.Counter({ name:'wb_search_err_total', help:'Total search errors' });
const searchLatencyP95 = new client.Gauge({ name:'wb_search_latency_p95_ms', help:'p95 search latency (ms)' });

// Lightweight in-memory reservoir for p95
const _latRes = [];
const _maxRes = 200;
function _observeLatency(ms){
  try{
    _latRes.push(ms);
    if(_latRes.length>_maxRes) _latRes.shift();
    const sorted = _latRes.slice().sort((a,b)=>a-b);
    const idx = Math.max(0, Math.ceil(sorted.length*0.95)-1);
    const p95 = sorted[idx] || 0;
    searchLatencyP95.set(p95);
  }catch(e){ /* ignore metrics errors */ }
}

function _withDb(cb){
  return new Promise((resolve)=>{
    try{
      const db = new sqlite3.Database(DB_PATH);
      db.serialize(()=>cb(db, resolve));
      db.close();
    }catch(e){
      resolve(null);
    }
  });
}

async function _ensureFts(db){
  return new Promise((resolve)=>{
    try{
      db.run(`CREATE VIRTUAL TABLE IF NOT EXISTS signals_fts USING fts5(
        ts UNINDEXED,
        type,
        title,
        entityId,
        accountId,
        payload_json,
        tokenize='porter'
      )`, (e)=>{ resolve(!e); });
    }catch(e){ resolve(false); }
  });
}

/**
 * Index an array of signals into the FTS table.
 * Accepts signals shaped like in signals-ingest: { ts,type,title,payload,source,entityId,accountId }
 */
export async function indexSignals(signals=[]){
  if(BREAKER) return { indexed:0, breaker:true };
  const started = Date.now();
  try{
    await _withDb(async (db, done)=>{
      const ok = await _ensureFts(db);
      if(!ok){ done({ indexed:0, fts:false }); return; }
      const insert = db.prepare(`INSERT INTO signals_fts(ts,type,title,entityId,accountId,payload_json) VALUES(?,?,?,?,?,?)`);
      let n=0;
      for(const s of signals||[]){
        try{
          const payloadWrap = { payload: s?.payload || {}, source: s?.source || null };
          insert.run([
            s?.ts || new Date().toISOString(),
            s?.type || '',
            s?.title || '',
            s?.entityId || '',
            s?.accountId || '',
            JSON.stringify(payloadWrap)
          ]);
          n++;
        }catch(e){ /* skip bad row */ }
      }
      try{ insert.finalize(()=>{}); }catch{}
      done({ indexed:n, fts:true });
    });
  }catch(e){
    try{ await logJson({ mod:'search', act:'indexSignals.err', msg: e?.message?.slice(0,120) }); }catch(_){}
  }finally{
    _observeLatency(Date.now()-started);
  }
  return { ok:true };
}

/**
 * Run an FTS search.
 * @param {string} query - FTS query
 * @param {string[]|undefined} sources - optional list of types to include
 * @param {number|undefined} limit - max rows
 */
export async \1
  const __t0 = Date.now(); wb_search_req_total.inc();
  searchReq.inc();
  const started = Date.now();
  if(BREAKER) return [];
  const safeLimit = Math.max(1, Math.min(parseInt(limit||50,10)||50, 200));
  const q = (query||'').toString().trim();
  if(!q) return [];

  let accountIdFilter = null;
  // Parse accountId:... or account:... tokens and remove from query
  let qNorm = q.replace(/\b(accountId|account):([^\s]+)/i, (_m,_k,v)=>{ accountIdFilter=v; return ''; }).trim();
  // Support subject: -> title:
  qNorm = qNorm.replace(/\bsubject:/ig, 'title:');

  const rows = await new Promise((resolve)=>{
    try{
      _withDb(async (db, done)=>{
        const ok = await _ensureFts(db);
        if(!ok){ done([]); return; }

        let sql = `SELECT ts,type,title,entityId,accountId,payload_json FROM signals_fts WHERE signals_fts MATCH ?`;
        const params = [ qNorm ];
        if(sources?.length){
          const placeholders = sources.map(()=>'?').join(',');
          sql += ` AND type IN (${placeholders})`;
          for(const s of sources) params.push((s||'').toString());
        }
        if(accountIdFilter){
          sql += ` AND accountId = ?`;
          params.push(accountIdFilter);
        }
        sql += ` ORDER BY rowid DESC LIMIT ?`;
        params.push(safeLimit);

        const stmt = db.prepare(sql);
        const out = [];
        try{
          stmt.all(params, (err, rs)=>{
            if(err){ resolve([]); return; }
            for(const r of rs||[]){
              let payload = {};
              let source = null;
              try{
                const pj = JSON.parse(r.payload_json||'{}');
                payload = pj?.payload || {};
                source = pj?.source || null;
              }catch(_){}
              out.push({
                ts: r.ts,
                type: r.type,
                title: r.title,
                payload,
                source,
                entityId: r.entityId || null,
                accountId: r.accountId || null
              });
            }
            resolve(out);
          });
        }catch(_e){ resolve([]); }
      });
    }catch(_e){ resolve([]); }
  }).catch(()=>[]);

  const elapsed = Date.now()-started;
  _observeLatency(elapsed);
  return rows;
}

export default { indexSignals, searchSignals };

export function trackSearchSuccess(durationMs){ try{ wbSearchReqTotal.inc(); wbSearchLatencyP95Ms.observe(durationMs||0); }catch(e){} }

export function trackSearchError(){ try{ wbSearchErrTotal.inc(); }catch(e){} }

// NOTE: Increment errors in catch blocks where applicable: wb_search_err_total.inc();
