import sqlite3 from 'sqlite3';
import path from 'path';
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');
function withDb(cb){ const db=new sqlite3.Database(DB_PATH); db.serialize(()=>cb(db)); db.close(); }

export function ensureAudit(){
  withDb(db=>{ db.run(`CREATE TABLE IF NOT EXISTS connector_audit(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider TEXT, account_id TEXT, event TEXT, status TEXT, ts INTEGER, details TEXT
  )`); });
}

export function logConnectorEvent({provider,account_id,event,status,ts,details}){
  ensureAudit();
  withDb(db=>{
    db.run(`INSERT INTO connector_audit(provider,account_id,event,status,ts,details)
            VALUES(?,?,?,?,?,?)`,
      [provider,account_id,event,status,ts||Date.now(),JSON.stringify(details||{})]);
  });
}
