import crypto from 'crypto'; import path from 'path'; import sqlite3 from 'sqlite3';
import { requireTenant } from '../../../lib/middleware/tenant.js';
const DB_PATH=process.env.DB_PATH||path.join(process.cwd(),'db','workbuoy.db');

export default function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'method_not_allowed'});
  const tenant_id=requireTenant(req,res); if(!tenant_id) return;
  const token = crypto.randomBytes(24).toString('hex');
  const db=new sqlite3.Database(DB_PATH);
  db.run(`INSERT INTO erasure_tokens(token,tenant_id) VALUES(?,?)`, [token,tenant_id], (e)=>{
    if(e) return res.status(500).json({error:'db_error'});
    res.json({ ok:true, confirm_url: `/portal/erasure/confirm?token=${token}` });
  });
}
