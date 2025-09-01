'use strict';
const path = require('path');
const SQLITE3 = require('sqlite3');
const { Pool } = require('pg');
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');
const pgPool = process.env.DATABASE_URL ? new Pool({ connectionString: process.env.DATABASE_URL }) : null;

async function getRole(tenant_id, user_id){
  if (!tenant_id || !user_id) return null;
  if (pgPool){
    const r = await pgPool.query('SELECT role FROM user_roles WHERE tenant_id=$1 AND user_id=$2',[tenant_id,user_id]);
    return r.rows[0]?.role || null;
  } else {
    return await new Promise((resolve)=>{
      const db = new SQLITE3.Database(DB_PATH);
      db.get('SELECT role FROM user_roles WHERE tenant_id=? AND user_id=?',[tenant_id,user_id], (_e,row)=> resolve(row?.role || null));
    });
  }
}

function requireRole(roles){
  return async function(req,res,next){
    const tenant_id = req.headers['x-tenant-id'] || req.headers['x_workbuoy_tenant'] || null;
    const user = req.headers['x-user-id'] || req.headers['x_workbuoy_user'] || null;
    const role = await getRole(tenant_id, user);
    if (!role || !roles.includes(role)) {
      res.status(403).json({ error:'forbidden' });
      return;
    }
    next();
  }
}

module.exports = { getRole, requireRole };
