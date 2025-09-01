import path from 'path'; import sqlite3 from 'sqlite3'; import crypto from 'crypto'; import { signToken } from '../../../../lib/auth.js';
const DB_PATH=process.env.DB_PATH||path.join(process.cwd(),'db','workbuoy.db');
export default function handler(req,res){
  const token=(req.query.token||req.body?.token||'').toString(); if(!token) return res.status(400).json({error:'missing_token'});
  const db=new sqlite3.Database(DB_PATH);
  db.get(`SELECT token,email,tenant_id,created_at,consumed_at FROM magic_links WHERE token=?`, [token], (err,row)=>{
    if(err||!row) return res.status(400).json({error:'invalid_token'});
    if(row.consumed_at) return res.status(400).json({error:'already_used'});
    db.get(`SELECT email FROM users WHERE email=?`, [row.email], (e2,u)=>{
      const ensureUser=(cb)=>{ if(u) return cb(); const pwd=crypto.createHash('sha256').update(token).digest('hex'); db.run(`INSERT INTO users(email,password_sha256,roles) VALUES(?,?,?)`, [row.email,pwd,'user'], cb); };
      ensureUser(()=>{
        const tenantId = row.tenant_id || row.email.split('@')[0].replace(/[^a-z0-9]/gi,'').slice(0,12) || crypto.randomBytes(3).toString('hex');
        const tenantName = row.email.split('@')[0]+"'s firma";
        db.run(`INSERT OR IGNORE INTO tenants(id,name) VALUES(?,?)`, [tenantId, tenantName], ()=>{
          db.run(`INSERT OR IGNORE INTO org_users(tenant_id,user_email,role) VALUES(?,?,?)`, [tenantId,row.email,'owner'], ()=>{
            db.run(`UPDATE magic_links SET consumed_at=datetime('now'), tenant_id=? WHERE token=?`, [tenantId, token], ()=>{
              const jwt=signToken({ email:row.email, tenant_id:tenantId }); res.json({ ok:true, token:jwt, tenant_id:tenantId });
            });
          });
        });
      });
    });
  });
}
