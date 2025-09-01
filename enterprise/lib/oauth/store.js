import sqlite3 from 'sqlite3';
import path from 'path';
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');
function withDb(cb){ const db = new sqlite3.Database(DB_PATH); db.serialize(()=>cb(db)); db.close(); }
export function ensureTables(){ withDb(db=>{
  db.run(`CREATE TABLE IF NOT EXISTS oauth_tokens(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider TEXT, account_id TEXT,
    access_token TEXT, refresh_token TEXT,
    expires_at INTEGER,
    created_at INTEGER DEFAULT (strftime('%s','now')),
    updated_at INTEGER DEFAULT (strftime('%s','now'))
  )`);
  db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_oauth_provider_account ON oauth_tokens(provider, account_id)`);
});}
export function upsertToken({ provider, account_id, access_token, refresh_token, expires_at }){
  ensureTables(); return new Promise((resolve,reject)=> withDb(db=>{
    db.run(`INSERT INTO oauth_tokens(provider,account_id,access_token,refresh_token,expires_at)
            VALUES(?,?,?,?,?)
            ON CONFLICT(provider,account_id) DO UPDATE SET
              access_token=excluded.access_token,
              refresh_token=COALESCE(excluded.refresh_token, oauth_tokens.refresh_token),
              expires_at=excluded.expires_at,
              updated_at=strftime('%s','now')`,
      [provider, account_id, access_token, refresh_token || null, expires_at || null],
      function(err){ if(err) reject(err); else resolve(true); });
  }));
}
export function getToken(provider, account_id){
  ensureTables(); return new Promise((resolve,reject)=> withDb(db=>{
    db.get(`SELECT * FROM oauth_tokens WHERE provider=? AND account_id=?`, [provider, account_id], (err,row)=>{
      if(err) reject(err); else resolve(row || null);
    });
  }));
}
