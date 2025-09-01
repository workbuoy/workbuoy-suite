import path from 'path'; import sqlite3 from 'sqlite3';
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');

export default async function handler(req,res){
  const tenant_id = req.headers['x-tenant-id'] || 'demo-tenant';
  const db = new sqlite3.Database(DB_PATH);
  const groupId = String(req.query.groupId||'');
  if(!groupId) return res.status(400).json({ error:'missing_group' });
  if(req.method==='GET'){
    db.all(`SELECT user_id FROM scim_group_members WHERE group_id=?`, [groupId], (e,rows)=>{
      if(e) return res.status(500).json({error:'db_error'});
      res.json({ Resources: rows.map(r=>({ value:r.user_id })) });
    });
  }else if(req.method==='POST'){
    const { userId } = req.body||{};
    if(!userId) return res.status(400).json({error:'missing_user'});
    db.run(`INSERT OR IGNORE INTO scim_group_members(group_id,user_id) VALUES(?,?)`, [groupId,userId], (e)=>{
      if(e) return res.status(500).json({error:'db_error'});
      res.status(201).json({ ok:true });
    });
  }else if(req.method==='DELETE'){
    const userId = String(req.query.userId||'');
    db.run(`DELETE FROM scim_group_members WHERE group_id=? AND user_id=?`, [groupId,userId], (e)=>{
      if(e) return res.status(500).json({error:'db_error'});
      res.status(204).end();
    });
  }else{
    res.status(405).json({error:'method_not_allowed'});
  }
}
