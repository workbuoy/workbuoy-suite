import sqlite3 from 'sqlite3';
import path from 'path';
import { auditLog } from '../../../lib/audit.js';
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');

export default function handler(req,res){
  const db = new sqlite3.Database(DB_PATH);
  if(req.method==='POST'){
    const { role_id, kpi, value } = req.body||{};
    db.serialize(()=>{
      db.run(`CREATE TABLE IF NOT EXISTS role_kpis(role_id TEXT, kpi TEXT, value REAL, ts TEXT DEFAULT (datetime('now'))) `);
      db.run(`INSERT INTO role_kpis(role_id,kpi,value) VALUES(?,?,?)`,[role_id,kpi,value]);
    });
    auditLog({ action:'role:kpi', details:{ role_id, kpi, value } });
    return res.json({ ok:true });
  }
  if(req.method==='GET'){
    const { role_id } = req.query||{};
    db.all(`SELECT * FROM role_kpis WHERE role_id = ? ORDER BY ts DESC LIMIT 100`,[role_id],(err,rows)=>{
      res.json({ rows: rows||[] });
    });
    return;
  }
  res.status(405).end();
}
