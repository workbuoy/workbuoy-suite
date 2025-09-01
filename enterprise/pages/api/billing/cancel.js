import path from 'path'; import sqlite3 from 'sqlite3';
import { recordBillingEvent } from '../../../lib/metrics/registry.js';
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');

export default function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'method_not_allowed'});
  const auth = req.headers.authorization || ''; const m = auth.match(/^Bearer\s+(.+)$/i); if(!m) return res.status(401).json({error:'missing_token'});
  const payload = require('../../../lib/auth.js').verifyToken(m[1]); if(!payload) return res.status(401).json({error:'invalid_token'});
  const tenant_id = payload.tenant_id;
  const db = new sqlite3.Database(DB_PATH);
  db.run(`UPDATE subscriptions SET status='canceled' WHERE tenant_id=?`, [tenant_id], ()=>{
    recordBillingEvent(tenant_id, 'cancel');
    res.json({ ok:true });
  });
}
