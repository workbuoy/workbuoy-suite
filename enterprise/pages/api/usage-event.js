import sqlite3 from 'sqlite3';
import path from 'path';
import { funnel } from './metrics.js';
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');

export default function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'method_not_allowed'});
  const { event, module='core', meta={} } = req.body||{};
  const db = new sqlite3.Database(DB_PATH);
  db.serialize(()=>{
    db.run(`CREATE TABLE IF NOT EXISTS usage_events(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ts TEXT DEFAULT (datetime('now')),
      user_email TEXT, event_name TEXT, module TEXT, metadata TEXT
    )`);
    db.run(`INSERT INTO usage_events(user_email,event_name,module,metadata) VALUES(?,?,?,?)`, ['', event, module, JSON.stringify(meta||{})]);
    funnel(event, { module });
    res.json({ ok:true });
    db.close();
  });
}