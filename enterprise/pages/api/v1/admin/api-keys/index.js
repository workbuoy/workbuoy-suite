import { withV1 } from '../_utils.js';
import { createApiKey } from '../../../../lib/auth/api-keys.js';
import path from 'path'; import sqlite3 from 'sqlite3';
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');

async function handler(req,res){
  const tenant_id = req.headers['x-tenant-id'] || 'demo-tenant';
  if(req.method==='GET'){
    const db = new sqlite3.Database(DB_PATH);
    db.all(`SELECT id, name, scope, active, created_at, last_used_at FROM api_keys WHERE tenant_id=?`, [tenant_id], (e, rows)=>{
      if(e) return res.status(500).json({ error:'db_error' });
      res.json({ items: rows });
    });
  }else if(req.method==='POST'){
    const { name, scope } = req.body||{};
    const out = await createApiKey({ tenant_id, name: name||'API Key', scope: scope||'public' });
    res.status(201).json({ id: out.id, secret: out.secret, scope: out.scope });
  }else{
    res.status(405).json({ error:'method_not_allowed' });
  }
}
export default withV1(handler, { requireKey:false });
