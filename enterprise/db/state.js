import sqlite3 from 'sqlite3';
import path from 'path';
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');
function withDb(cb){ const db = new sqlite3.Database(DB_PATH); db.serialize(()=>cb(db)); db.close(); }

export function ensureStateTable(){
  withDb(db=>{
    db.run(`CREATE TABLE IF NOT EXISTS connector_state(
      provider TEXT, account_id TEXT, key TEXT, value TEXT, updated_at INTEGER,
      PRIMARY KEY(provider,account_id,key)
    )`);
  });
}

export function setState(provider, account_id, key, value){
  ensureStateTable();
  return new Promise((resolve,reject)=> withDb(db=>{
    db.run(`INSERT INTO connector_state(provider,account_id,key,value,updated_at)
            VALUES(?,?,?,?,strftime('%s','now'))
            ON CONFLICT(provider,account_id,key) DO UPDATE SET
              value=excluded.value, updated_at=strftime('%s','now')`,
      [provider,account_id,key,value], err=> err?reject(err):resolve(true));
  }));
}

export function getState(provider, account_id, key){
  ensureStateTable();
  return new Promise((resolve,reject)=> withDb(db=>{
    db.get(`SELECT value FROM connector_state WHERE provider=? AND account_id=? AND key=?`,
      [provider,account_id,key], (err,row)=> err?reject(err):resolve(row?.value||null));
  }));
}
