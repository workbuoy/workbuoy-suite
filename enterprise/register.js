import rateLimit from '../../lib/middleware/rate-limit.js';
import crypto from 'crypto';
import sqlite3 from 'sqlite3';
import path from 'path';
import { signToken } from '../../lib/auth.js';
import { funnel } from '../metrics.js';

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');

const handler = function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'method_not_allowed'});
  const { email, password, selected_module='', role_id='', company='' } = req.body||{};
  if(!email || !password) return res.status(400).json({error:'missing_fields'});
  const db = new sqlite3.Database(DB_PATH);
  db.serialize(()=>{
    db.run(`CREATE TABLE IF NOT EXISTS users(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_sha256 TEXT NOT NULL,
      roles TEXT NOT NULL DEFAULT 'user',
      selected_module TEXT,
      role_id TEXT,
      company TEXT,
      created_ts TEXT DEFAULT (datetime('now'))
    )`);
    const sha = crypto.createHash('sha256').update(password).digest('hex');
    db.run(`INSERT OR IGNORE INTO users(email,password_sha256,roles,selected_module,role_id,company) VALUES(?,?,?,?,?,?)`,
      [email, sha, 'user', selected_module, role_id, company],
      function(err){
        if(err){ console.error(err); return res.status(500).json({error:'db_error'}); }
        const token = signToken({ email, roles:['user'] });
        funnel('onboarding_completed', { module:selected_module||'unknown' });
        res.json({ user: { email, selected_module, role_id }, token });
        db.close();
      });
  });
}
export default rateLimit({ capacity: 30, refillPerSec: 0.5 })(handler);
