let __cache=new Map(); const CACHE_TTL_MS=30000;
import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');
const CATALOG_PATH = path.join(process.cwd(),'public','config','integrations.catalog.json');

function withDb(cb){
  const db = new sqlite3.Database(DB_PATH);
  db.serialize(()=>cb(db));
  db.close(); __cache.set(key,{t:Date.now(),v:__v}); return res.status(200).json(__v);
}

function readStatus(user_id){
  return new Promise(resolve=>{
    withDb(db=>{
      db.run(`CREATE TABLE IF NOT EXISTS integrations_status(
        user_id TEXT NOT NULL, provider TEXT NOT NULL, status TEXT NOT NULL, meta TEXT, updated_at TEXT DEFAULT (datetime('now')),
        PRIMARY KEY(user_id, provider)
      )`);
      db.all(`SELECT provider, status, meta, updated_at FROM integrations_status WHERE user_id=?`, [user_id], (err, rows)=>{
        const map = {}; (rows||[]).forEach(r=> map[r.provider] = { status: r.status, meta: safeJson(r.meta), updated_at:r.updated_at });
        resolve(map);
      });
    });
  }); __cache.set(key,{t:Date.now(),v:__v}); return res.status(200).json(__v);
}

function safeJson(s){ try{ return JSON.parse(s||'{}'); }catch{ return {}; } }

export default async function handler(req,res){
  const tenant=(req.headers['x-tenant-id']||'anon'); const key=`list:${tenant}`; const now=Date.now(); const hit=__cache.get(key); if(hit && (now-hit.t)<CACHE_TTL_MS){ const __v=(hit.v);} 
  const user_id = (req.headers['x-user-id'] || 'demo').toString();
  if(req.method!=='POST'){ res.status(405).json({ok:false,error:'Method not allowed'}); return; }
  try{
    const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH,'utf-8'));
    const status = await readStatus(user_id);
    const providers = (catalog.providers||[]).map(p=> ({
      ...p,
      status: status[p.id]?.status || 'unconnected',
      status_meta: status[p.id]?.meta || {}
    }));
    res.json({ ok:true, data:{ providers } });
  }catch(e){
    res.status(500).json({ ok:false, error: String(e&&e.message||e) });
  }
}
