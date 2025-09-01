import { withV1 } from '../_utils.js';
import path from 'path'; import sqlite3 from 'sqlite3';
import { deliver } from '../../../../lib/webhooks/deliver.js';
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');

async function handler(req,res){
  const tenant_id = req.headers['x-tenant-id'] || 'demo-tenant';
  const { endpoint_id, event } = req.body||{};
  const db = new sqlite3.Database(DB_PATH);
  db.get(`SELECT * FROM webhook_endpoints WHERE id=? AND tenant_id=?`, [endpoint_id, tenant_id], async (e,row)=>{
    if(e || !row) return res.status(404).json({ error:'not_found' });
    const status = await deliver(row, event||'test.event', { ok:true, event });
    res.json({ ok:true, status });
  });
}
export default withV1(handler, { requireKey:false });
