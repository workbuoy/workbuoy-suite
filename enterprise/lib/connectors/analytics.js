import sqlite3 from 'sqlite3';
import path from 'path';
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');

function withDb(cb){
  const db = new sqlite3.Database(DB_PATH);
  db.serialize(()=>cb(db));
  db.close();
}

export function upsertSalesFacts(rows){
  if(!rows || !rows.length) return;
  withDb(db=>{
    db.run(`CREATE TABLE IF NOT EXISTS facts_sales(
      date TEXT NOT NULL, customer_id TEXT NOT NULL, product_id TEXT NOT NULL,
      ytd REAL, ly_ytd REAL, qtd REAL, lq_qtd REAL, mtd REAL, lm_mtd REAL, target REAL,
      updated_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY(date, customer_id, product_id)
    )`);
    const stmt = db.prepare(`INSERT OR REPLACE INTO facts_sales(date,customer_id,product_id,ytd,ly_ytd,qtd,lq_qtd,mtd,lm_mtd,target,updated_at)
      VALUES(?,?,?,?,?,?,?,?,?,?,datetime('now'))`);
    rows.forEach(r=> stmt.run([r.date,r.customer_id,r.product_id,r.ytd,r.ly_ytd,r.qtd,r.lq_qtd,r.mtd,r.lm_mtd,r.target]));
    stmt.finalize();
  });
}

export function readSalesFacts({date}){
  return new Promise(resolve=>{
    withDb(db=>{
      db.all(`SELECT * FROM facts_sales WHERE date = ?`, [date], (err,rows)=> resolve(rows||[]));
    });
  });
}
