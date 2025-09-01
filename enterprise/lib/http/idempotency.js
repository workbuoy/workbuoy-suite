import path from 'path'; import sqlite3 from 'sqlite3'; import crypto from 'crypto';
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');

export async function checkIdempotency(tenant_id, key, method, path){
  if(!key) return null;
  const db = new sqlite3.Database(DB_PATH);
  return await new Promise((res)=> db.get(`SELECT response_hash FROM idempotency_keys WHERE key=? AND tenant_id=?`, [key, tenant_id], (e,row)=> res(row?.response_hash||null)));
}

export async function storeIdempotency(tenant_id, key, method, path, body){
  if(!key) return;
  const hash = crypto.createHash('sha256').update(JSON.stringify(body||{})).digest('hex');
  const db = new sqlite3.Database(DB_PATH);
  await new Promise((res)=> db.run(`INSERT OR REPLACE INTO idempotency_keys(key,tenant_id,method,path,response_hash) VALUES(?,?,?,?,?)`,
    [key, tenant_id, method, path, hash], ()=>res()));
  return hash;
}
