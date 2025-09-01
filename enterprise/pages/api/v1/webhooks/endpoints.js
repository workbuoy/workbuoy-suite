import { withV1 } from '../../_utils.js';
import path from 'path'; import sqlite3 from 'sqlite3';
import { deliver } from '../../../../lib/webhooks/deliver.js';
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');

async function handler(req,res){
  const tenant_id = req.headers['x-tenant-id'] || 'demo-tenant';
  const db = new sqlite3.Database(DB_PATH);
  if(req.method==='GET'){
    db.all(`SELECT id, url, events, active, created_at FROM webhook_endpoints WHERE tenant_id=?`, [tenant_id], (e,rows)=>{
      if(e) return res.status(500).json({ error:'db_error' });
      rows = rows.map(r=> ({ ...r, events: JSON.parse(r.events||'[]') }));
      res.json({ items: rows });
    });
  }else if(req.method==='POST'){
    const { url, events } = req.body||{};
    const id = 'we_' + Date.now();
    const secret = require('crypto').randomBytes(24).toString('hex');
    db.run(`INSERT INTO webhook_endpoints(id, tenant_id, url, secret, events, active) VALUES(?,?,?,?,?,1)`,
      [id, tenant_id, url, secret, JSON.stringify(events||[])], (e)=>{
        if(e) return res.status(500).json({ error:'db_error' });
        res.status(201).json({ id, secret });
      });
  }else{
    res.status(405).json({ error:'method_not_allowed' });
  }
}
export default withV1(handler, { requireKey:false });
