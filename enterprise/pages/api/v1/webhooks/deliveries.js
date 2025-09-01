import path from 'path'; import sqlite3 from 'sqlite3';
import { withV1 } from '../_utils.js';
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');
export default withV1(async function handler(req,res){
  const tenant_id = req.headers['x-tenant-id'] || 'demo-tenant';
  const db = new sqlite3.Database(DB_PATH);
  db.all(`SELECT id, endpoint_id, event, status, attempts FROM webhook_deliveries ORDER BY ts DESC LIMIT 200`, [], (e,rows)=>{
    if(e) return res.status(500).json({ error:'db_error' });
    res.json({ items: rows });
  });
}, { requireKey:false });
