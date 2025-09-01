import sqlite3 from 'sqlite3';
import path from 'path';
import { indexSignals } from './search.js';
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');

export function ingest(signals){
  return new Promise((resolve,reject)=>{
    const db = new sqlite3.Database(DB_PATH);
    db.serialize(()=>{
      db.run(`CREATE TABLE IF NOT EXISTS signals(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ts TEXT, type TEXT, title TEXT,
        payload TEXT, source TEXT, entity_id TEXT, account_id TEXT
      )`);
      const stmt = db.prepare(`INSERT INTO signals(ts,type,title,payload,source,entity_id,account_id) VALUES(?,?,?,?,?,?,?)`);
      for(const s of signals||[]){
        stmt.run([s.ts || new Date().toISOString(), s.type||'event', s.title||'', JSON.stringify(s.payload||{}), s.source||'', s.entityId||'', s.accountId||'']);
      }
      stmt.finalize((e)=>{
        if(e) return reject(e);
        db.close(); resolve({ inserted: (signals||[]).length  try{ await indexSignals(signals); }catch(_e){} });
      });
    });
  });
}
export default { ingest };
