import argon2 from 'argon2';
import crypto from 'crypto';
import path from 'path'; import sqlite3 from 'sqlite3';
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');

export async function createApiKey({ tenant_id, name, scope='public' }){
  const plain = 'wb_' + crypto.randomBytes(24).toString('hex');
  const key_id = 'k_' + crypto.randomBytes(8).toString('hex');
  const hash = await argon2.hash(plain, { type: argon2.argon2id });
  const db = new sqlite3.Database(DB_PATH);
  await new Promise((res,rej)=> db.run(`INSERT INTO api_keys(id,tenant_id,name,key_hash,scope,active) VALUES(?,?,?,?,?,1)`, [key_id, tenant_id, name, hash, scope], (e)=> e?rej(e):res()));
  return { id:key_id, secret: plain, scope };
}

export async function verifyApiKey(secret){
  if(!secret) return null;
  const db = new sqlite3.Database(DB_PATH);
  const rows = await new Promise((res)=> db.all(`SELECT * FROM api_keys WHERE active=1`, [], (e,rows)=> res(rows||[])));
  for(const r of rows){
    if(await argon2.verify(r.key_hash, secret)) return r;
  }
  return null;
}

export async function rotateApiKey({ tenant_id, id, name, scope='public' }){
  // deactivate old, create new
  const db = new sqlite3.Database(DB_PATH);
  await new Promise((res)=> db.run(`UPDATE api_keys SET active=0 WHERE id=? AND tenant_id=?`, [id, tenant_id], ()=>res()));
  return await createApiKey({ tenant_id, name: name||('rotated-'+id), scope });
}

export async function logUsage(api_key_id, path, status){
  const db = new sqlite3.Database(DB_PATH);
  db.run(`INSERT INTO api_key_usages(api_key_id, path, status) VALUES(?,?,?)`, [api_key_id, path, status], ()=>{});
}

export default { createApiKey, verifyApiKey, rotateApiKey, logUsage };
