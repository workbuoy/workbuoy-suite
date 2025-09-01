import rateLimit from '../../lib/middleware/rate-limit.js';
import sqlite3 from 'sqlite3';
import path from 'path';
import { funnel } from './metrics.js';
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');

const handler = function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'method_not_allowed'});
  const { email='', company='', size='', compliance='' } = req.body||{};
  const db = new sqlite3.Database(DB_PATH);
  db.serialize(()=>{
    db.run(`CREATE TABLE IF NOT EXISTS usage_events(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ts TEXT DEFAULT (datetime('now')),
      user_email TEXT, event_name TEXT, module TEXT, metadata TEXT
    )`);
    const meta = JSON.stringify({ email, company, size, compliance });
    db.run(`INSERT INTO usage_events(user_email,event_name,module,metadata) VALUES(?,?,?,?)`, [email, 'enterprise_lead_submitted', 'secure', meta]);
    funnel('enterprise_lead_submitted', { });
    res.json({ ok:true });
    db.close();
  });
}
export default rateLimit({ capacity: 30, refillPerSec: 0.5 })(handler);
