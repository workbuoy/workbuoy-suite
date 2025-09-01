// Auto-created by enterprise last-mile
import fs from 'fs';
import path from 'path';
import sqlite3pkg from 'sqlite3';
const sqlite3 = sqlite3pkg.verbose();

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'db', 'workbuoy.db');

function ensureDir(){ const dir = path.dirname(DB_PATH); if(!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true}); }

function migrateSqlite(){
  ensureDir();
  const db = new sqlite3.Database(DB_PATH);
  db.serialize(()=>{
    db.run(`CREATE TABLE IF NOT EXISTS schema_version(version INTEGER NOT NULL)`);
    db.get(`SELECT version FROM schema_version`, (err,row)=>{ if(!row){ db.run(`INSERT INTO schema_version(version) VALUES(1)`); }});

    db.run(`CREATE TABLE IF NOT EXISTS connector_state(
      connector TEXT NOT NULL,
      account TEXT NOT NULL,
      last_sync TEXT,
      PRIMARY KEY(connector, account)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS audit_logs_worm(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ts TEXT NOT NULL,
      user TEXT,
      action TEXT,
      details TEXT,
      prev_hash TEXT,
      hash TEXT
    )`);
  });
  db.close();
  console.log('[migrate] sqlite complete');
}

(async()=>{
  migrateSqlite();
})().catch(e=>{ console.error('[migrate] failed', e); process.exit(1); });
