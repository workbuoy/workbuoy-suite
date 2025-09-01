
// Multi-level cache: L1 in-memory LRU, L2 sqlite persistent with TTL
import sqlite3 from 'sqlite3';
import path from 'path';
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');
const L1_MAX = 5000;
const L1 = new Map();

function l1Put(k,v){ if(L1.has(k)) L1.delete(k); L1.set(k,{v,ts:Date.now()}); if(L1.size>L1_MAX){ const first=L1.keys().next().value; L1.delete(first);} }

function withDb(cb){ const db=new sqlite3.Database(DB_PATH); db.serialize(()=>cb(db)); db.close(); }
function ensure(){ withDb(db=>{ db.run(`CREATE TABLE IF NOT EXISTS kv_cache(key TEXT PRIMARY KEY, value TEXT, expiry INTEGER)`); }); }

export async function get(key){
  const now = Date.now();
  const e = L1.get(key);
  if(e && e.ts + 60_000 > now) return e.v; // 1m fresh in L1
  ensure();
  return new Promise(resolve=>{
    withDb(db=>{
      db.get(`SELECT value, expiry FROM kv_cache WHERE key=?`, [key], (e,row)=>{
        if(!row){ resolve(undefined); return; }
        if(row.expiry && row.expiry < now){ resolve(undefined); return; }
        try{ const v = JSON.parse(row.value); l1Put(key, v); resolve(v); } catch{ resolve(undefined); }
      });
    });
  });
}
export async function set(key, value, ttlSec=600){
  ensure();
  const expiry = Date.now() + (ttlSec*1000);
  l1Put(key, value);
  withDb(db=>{
    db.run(`INSERT OR REPLACE INTO kv_cache(key,value,expiry) VALUES(?,?,?)`, [key, JSON.stringify(value), expiry]);
  });
}
export default { get, set };
