
import sqlite3 from 'sqlite3';
import path from 'path';
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');
function withDb(cb){ const db=new sqlite3.Database(DB_PATH); db.serialize(()=>cb(db)); db.close(); }

export function ensureTables(){
  withDb(db=>{
    db.run(`CREATE TABLE IF NOT EXISTS retry_queue(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      connector TEXT, op_type TEXT, payload_json TEXT,
      retry_at TEXT, attempts INTEGER DEFAULT 0
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS dlq(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      connector TEXT, payload_json TEXT, failed_reason TEXT, failed_at TEXT DEFAULT (datetime('now'))
    )`);
  });
}
export function enqueueRetry(connector, opType, payload, delaySec=60){
  ensureTables();
  withDb(db=>{
    const t = new Date(Date.now() + delaySec*1000).toISOString();
    db.run(`INSERT INTO retry_queue(connector,op_type,payload_json,retry_at,attempts) VALUES(?,?,?,?,0)`,
      [connector, opType, JSON.stringify(payload||{}), t]);
  });
}
export function nextRetryBatch(limit=50){
  return new Promise(resolve=>{
    withDb(db=>{
      db.all(`SELECT * FROM retry_queue WHERE datetime(retry_at) <= datetime('now') ORDER BY retry_at LIMIT ?`, [limit], (e,rows)=>{
        resolve(rows||[]);
      });
    });
  });
}
export function bumpRetry(id, backoffSec, maxAttempts=5, reason='error'){
  withDb(db=>{
    db.get(`SELECT attempts, connector, payload_json FROM retry_queue WHERE id=?`, [id], (e,row)=>{
      if(!row){ return; }
      const attempts = (row.attempts||0)+1;
      if(attempts>=maxAttempts){
        db.run(`INSERT INTO dlq(connector,payload_json,failed_reason) VALUES(?,?,?)`, [row.connector, row.payload_json, reason]);
        db.run(`DELETE FROM retry_queue WHERE id=?`, [id]);
      } else {
        const t = new Date(Date.now() + backoffSec*1000).toISOString();
        db.run(`UPDATE retry_queue SET attempts=?, retry_at=? WHERE id=?`, [attempts, t, id]);
      }
    });
  });
}
export function queueDepth(){
  return new Promise(resolve=>{
    withDb(db=>{
      db.get(`SELECT COUNT(*) AS depth FROM retry_queue`, [], (e,row)=>{
        const d = row?.depth||0;
        db.get(`SELECT COUNT(*) AS d2 FROM dlq`, [], (ee, r2)=>{
          resolve({ retry: d, dlq: r2?.d2||0 });
        });
      });
    });
  });
}
