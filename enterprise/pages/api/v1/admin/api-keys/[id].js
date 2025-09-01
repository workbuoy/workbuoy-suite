import { withV1 } from '../../_utils.js';
import path from 'path'; import sqlite3 from 'sqlite3';
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');

async function handler(req,res){
  const tenant_id = req.headers['x-tenant-id'] || 'demo-tenant';
  const id = req.query.id;
  const db = new sqlite3.Database(DB_PATH);
  if(req.method==='DELETE'){
    db.run(`UPDATE api_keys SET active=0 WHERE id=? AND tenant_id=?`, [id, tenant_id], (e)=>{
      if(e) return res.status(500).json({ error:'db_error' });
      res.status(204).end();
    });
  }else{
    res.status(405).json({ error:'method_not_allowed' });
  }
}
export default withV1(handler, { requireKey:false });
