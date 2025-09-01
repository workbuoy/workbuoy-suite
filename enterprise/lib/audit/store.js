'use strict';
const path = require('path');
const SQLITE3 = require('sqlite3');
const { Pool } = require('pg');

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');
const pgPool = process.env.DATABASE_URL ? new Pool({ connectionString: process.env.DATABASE_URL }) : null;

async function appendAudit({ tenant_id, user_id, action, target, details }){
  if (pgPool){
    await pgPool.query('INSERT INTO audit_log(tenant_id,user_id,action,target,details) VALUES($1,$2,$3,$4,$5)',
      [tenant_id, user_id||null, action, target||null, details ? JSON.stringify(details) : null]);
  } else {
    await new Promise((resolve)=>{
      const db = new SQLITE3.Database(DB_PATH);
      db.run('INSERT INTO audit_log(tenant_id,user_id,action,target,details) VALUES(?,?,?,?,?)',
             [tenant_id, user_id||null, action, target||null, details ? JSON.stringify(details) : null], (_)=>resolve());
    });
  }
}
async function listAudit({ tenant_id, limit=100 }){
  if (pgPool){
    const r = await pgPool.query('SELECT id, tenant_id, user_id, action, target, details, ts FROM audit_log WHERE tenant_id=$1 ORDER BY ts DESC LIMIT $2',[tenant_id, limit]);
    return r.rows;
  } else {
    return await new Promise((resolve)=>{
      const db = new SQLITE3.Database(DB_PATH);
      db.all('SELECT id, tenant_id, user_id, action, target, details, ts FROM audit_log WHERE tenant_id=? ORDER BY ts DESC LIMIT ?',[tenant_id, limit], (_e,rows)=>resolve(rows||[]));
    });
  }
}
module.exports = { appendAudit, listAudit };
