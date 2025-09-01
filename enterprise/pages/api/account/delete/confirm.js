import path from 'path'; import sqlite3 from 'sqlite3';
import { performErasure } from '../../../lib/jobs/erasure.js';
const DB_PATH=process.env.DB_PATH||path.join(process.cwd(),'db','workbuoy.db');

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'method_not_allowed'});
  const token=(req.query.token||req.body?.token||'').toString();
  const db=new sqlite3.Database(DB_PATH);
  db.get(`SELECT token,tenant_id,confirmed_at FROM erasure_tokens WHERE token=?`, [token], async (e,row)=>{
    if(e||!row) return res.status(400).json({error:'invalid_token'});
    if(row.confirmed_at) return res.json({ok:true, status:'already_confirmed'});
    db.run(`UPDATE erasure_tokens SET confirmed_at=datetime('now') WHERE token=?`, [token], async ()=>{
      try{
        const out = await performErasure(row.tenant_id);
        res.json({ ok:true, job: out });
      }catch(err){
        res.status(500).json({error:'erasure_failed'});
      }
    });
  });
}
