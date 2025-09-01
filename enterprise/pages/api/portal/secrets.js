import path from 'path';import sqlite3 from 'sqlite3';import { requireTenant } from '../../../lib/middleware/tenant.js';const DB_PATH=process.env.DB_PATH||path.join(process.cwd(),'db','workbuoy.db');export default function handler(req,res){const tenant_id=requireTenant(req,res);if(!tenant_id)return;const db=new sqlite3.Database(DB_PATH);if(req.method==='GET'){db.all(`SELECT name,ref_key,updated_at FROM secrets WHERE tenant_id=?`,[tenant_id],(err,rows)=>{if(err)return res.status(500).json({error:'db_error'});res.json(rows||[]);});}else if(req.method==='POST'){const {name,ref_key}=req.body||{};if(!name||!ref_key)return res.status(400).json({error:'missing_fields'});db.run(`INSERT INTO secrets(tenant_id,name,ref_key) VALUES(?,?,?) ON CONFLICT(tenant_id,name) DO UPDATE SET ref_key=excluded.ref_key, updated_at=datetime('now')`,[tenant_id,name,ref_key],(err)=>{if(err)return res.status(500).json({error:'db_error'});res.json({ok:true});});}else{res.status(405).json({error:'method_not_allowed'});} }

  // RBAC admin+ check
  try {
    const auth = req.headers.authorization || '';
    const m = auth.match(/^Bearer\s+(.+)$/i);
    if(!m){ return res.status(401).json({error:'missing_token'}); }
    const payload = require('../../../../lib/auth.js').verifyToken(m[1]);
    if(!payload){ return res.status(401).json({error:'invalid_token'}); }
    const db = new (require('sqlite3').Database)(process.env.DB_PATH || require('path').join(process.cwd(),'db','workbuoy.db'));
    await new Promise((resolve,reject)=> db.get(`SELECT role FROM org_users WHERE tenant_id=? AND user_email=?`, [payload.tenant_id,payload.email], (e,row)=>{ if(e) reject(e); else { if(!row || !['owner','admin'].includes(row.role)) { resolve('deny'); } else resolve(row);} }));
    if (typeof roleCheck !== 'object') { /* deny */ return res.status(403).json({error:'forbidden'}); }
  } catch(_){ return res.status(403).json({error:'forbidden'}); }
