
import path from 'path'; import sqlite3 from 'sqlite3';
import { getRole } from '../../../lib/auth/rbac.js';
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');

export default async function handler(req,res){
  const tenant_id = req.headers['x-tenant-id'] || 'demo-tenant';
  const user_id = req.headers['x-user-id'] || '';
  const role = await getRole(tenant_id, user_id);
  if(role!=='admin') return res.status(403).json({error:'forbidden'});
  const db = new sqlite3.Database(DB_PATH);

  if(req.method==='GET'){
    db.all(`SELECT user_id, role FROM user_roles WHERE tenant_id=?`, [tenant_id], (e, rows)=>{
      if(e) return res.status(500).json({error:'db_error'});
      res.json({ ok:true, users: rows });
    });
  }else if(req.method==='POST'){
    const { target_user, role } = req.body||{};
    if(!target_user || !role) return res.status(400).json({error:'bad_request'});
    db.run(`INSERT INTO user_roles(tenant_id,user_id,role) VALUES(?,?,?)
            ON CONFLICT(tenant_id,user_id) DO UPDATE SET role=excluded.role`,
          [tenant_id, target_user, role], (e)=>{
      if(e) return res.status(500).json({error:'db_error'});
      res.json({ ok:true });
    });
  }else{
    res.status(405).json({error:'method_not_allowed'});
  }
}
