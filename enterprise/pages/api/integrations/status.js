import path from 'path';
import sqlite3 from 'sqlite3';

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');

function withDb(cb){
  const db = new sqlite3.Database(DB_PATH);
  db.serialize(()=>cb(db));
  db.close();
}

export default async function handler(req,res){
  const user_id = (req.headers['x-user-id'] || 'demo').toString();
  if(req.method!=='GET'){ res.status(405).json({ok:false,error:'Method not allowed'}); return; }
  withDb(db=>{
    db.all(`SELECT provider, status, meta, updated_at FROM integrations_status WHERE user_id=? ORDER BY updated_at DESC`, [user_id], (err, rows)=>{
      const items = (rows||[]).map(r=>({ provider:r.provider, status:r.status, meta: safeJson(r.meta), updated_at: r.updated_at }));
      res.json({ ok:true, data:{ items } });
    });
  });
}
function safeJson(s){ try{ return JSON.parse(s||'{}'); }catch{ return {}; } }
