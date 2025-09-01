/**
 * Verify feedback with windows per action type.
 * Windows:
 *  - Email: 30 min
 *  - Meeting: 2–4 h
 *  - Deal step: 24–48 h
 * We reuse usage_events (event_name='feedback') and crm_notes (or signals) as proxy for CRM actions.
 * Mark verified_action=1 on usage_events.metadata JSON when validated within window.
 */
import sqlite3 from 'sqlite3';
import path from 'path';

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');
const ENABLE_VERIFIED_LEARNING = (process.env.ENABLE_VERIFIED_LEARNING||'false').toString().toLowerCase()==='true';

function windowFor(actionType){
  const t = (actionType||'').toLowerCase();
  if(t==='email') return { minMinutes: 0, maxMinutes: 30 };
  if(t==='meeting') return { minMinutes: 120, maxMinutes: 240 };
  if(t==='deal' || t==='deal step' || t==='deal_step') return { minMinutes: 24*60, maxMinutes: 48*60 };
  return null;
}

const db = new sqlite3.Database(DB_PATH);

function run(){
  if(!ENABLE_VERIFIED_LEARNING){
    console.warn('[verify-feedback] ENABLE_VERIFIED_LEARNING is false; warn-only, no changes.');
    return;
  }
  db.serialize(()=>{
    // ensure tables exist (no new tables added)
    db.run(`CREATE TABLE IF NOT EXISTS usage_events(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ts TEXT DEFAULT (datetime('now')),
      user_email TEXT, event_name TEXT, module TEXT, metadata TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS crm_notes(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ts TEXT DEFAULT (datetime('now')),
      user_email TEXT, note_type TEXT, payload TEXT
    )`);

    db.all(`SELECT id, ts, user_email, event_name, metadata FROM usage_events WHERE event_name='feedback'`, [], (err, rows)=>{
      if(err){ console.error(err); return; }
      rows.forEach(row=>{
        let meta = {};
        try{ meta = JSON.parse(row.metadata||'{}'); }catch{ meta = {}; }
        const actionType = meta.action_type || meta.actionType || '';
        const win = windowFor(actionType);
        if(!win) return;
        // Find a matching CRM note within window
        const q = `SELECT 1 FROM crm_notes WHERE user_email=? AND ts BETWEEN datetime(?, ?||' minutes') AND datetime(?, ?||' minutes') LIMIT 1`;
        db.get(q, [row.user_email, row.ts, win.minMinutes, row.ts, win.maxMinutes], (e, match)=>{
          if(e){ console.warn('query error', e); return; }
          if(match){
            meta.verified_action = true;
            const upd = `UPDATE usage_events SET metadata=? WHERE id=?`;
            db.run(upd, [JSON.stringify(meta), row.id]);
          }
        });
      });
    });
  });
}
run();
db.close();
