import sqlite3 from 'sqlite3';
import path from 'path';
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');

function withDb(cb){
  const db = new sqlite3.Database(DB_PATH);
  db.serialize(()=>cb(db));
  db.close();
}

export function publishSignal(signal){
  withDb(db=>{
    db.run(`CREATE TABLE IF NOT EXISTS signals(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ts TEXT DEFAULT (datetime('now')),
      type TEXT, title TEXT,
      urgency REAL, impact REAL, severity TEXT,
      payload TEXT
    )`);
    db.run(`INSERT INTO signals(type,title,urgency,impact,severity,payload) VALUES(?,?,?,?,?,?)`,
      [signal.type||'',signal.title||'', signal.urgency||0, signal.impact||0, signal.severity||'info', JSON.stringify(signal.payload||{})]);
  });
}

export function listSignals(limit=50){
  return new Promise(resolve=>{
    withDb(db=>{
      db.all(`SELECT * FROM signals ORDER BY id DESC LIMIT ?`, [limit], (err,rows)=>{
        resolve(rows||[]);
      });
    });
  });
}
