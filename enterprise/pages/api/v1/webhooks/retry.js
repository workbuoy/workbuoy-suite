import path from 'path'; import sqlite3 from 'sqlite3';
import { withV1 } from '../_utils.js';
import { enqueueDelivery } from '../../../../lib/webhooks/deliver.js';
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');
export default withV1(async function handler(req,res){
  const id = req.body?.id;
  const db = new sqlite3.Database(DB_PATH);
  db.get(`SELECT wd.id, we.id as endpoint_id, we.url, we.secret FROM webhook_deliveries wd JOIN webhook_endpoints we ON we.id=wd.endpoint_id WHERE wd.id=?`, [id], async (e,row)=>{
    if(e || !row) return res.status(404).json({ error:'not_found' });
    await enqueueDelivery({ id: row.endpoint_id, url: row.url, secret: row.secret }, 'webhook.retry', { retryOf: id });
    res.json({ ok:true });
  });
}, { requireKey:false });
