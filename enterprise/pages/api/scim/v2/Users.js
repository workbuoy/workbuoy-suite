import path from 'path'; import sqlite3 from 'sqlite3';
import crypto from 'crypto';
import { appendAudit } from '../../../../lib/audit/store.js';
import registry from '../../../../lib/metrics/registry.js';
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');

function etagFor(row){
  const s = JSON.stringify([row.id,row.userName,row.givenName,row.familyName,row.active]);
  return crypto.createHash('sha1').update(s).digest('hex');
}

export default async function handler(req,res){
  const tenant_id = req.headers['x-tenant-id'] || 'demo-tenant';
  const db = new sqlite3.Database(DB_PATH);
  const op = req.method;
  if(op==='GET'){
    const startIndex = Math.max(1, parseInt(String(req.query.startIndex||'1'),10) || 1);
    const count = Math.min(1000, Math.max(1, parseInt(String(req.query.count||'100'),10) || 100));
    const filter = String(req.query.filter||'').trim(); // e.g., userName eq "alice"
    let where = 'tenant_id=?'; const params=[tenant_id];
    if(filter){
      const m = filter.match(/userName\s+eq\s+\"([^\"]+)\"/i);
      if(m){ where += ' AND userName=?'; params.push(m[1]); }
    }
    const offset = startIndex - 1;
    db.all(`SELECT id, userName, givenName, familyName, active FROM scim_users WHERE ${where} LIMIT ? OFFSET ?`, params.concat([count, offset]), (e,rows)=>{
      if(e) return res.status(500).json({error:'db_error'});
      res.json({ Resources: rows, startIndex, itemsPerPage: count, totalResults: rows.length, schemas: ["urn:ietf:params:scim:api:messages:2.0:ListResponse"] });
    });
  }else if(op==='POST'){
    const id = req.body?.id || `usr_${Date.now()}`;
    const { userName, name={}, active=true } = req.body||{};
    db.run(`INSERT INTO scim_users(id,tenant_id,userName,givenName,familyName,active,raw) VALUES(?,?,?,?,?,?,?)`,
      [id, tenant_id, userName, name.givenName||null, name.familyName||null, active?1:0, JSON.stringify(req.body||{})], (e)=>{
        if(e) return res.status(500).json({error:'db_error'});
        try{ (registry.counters.scim_mutations_total||{labels:()=>({inc:()=>{}})}).labels('user','create').inc(); }catch(_){}
        appendAudit({ tenant_id, action:'scim_create_user', target: id, details:{ userName } });
        const row = { id, userName, givenName:name.givenName, familyName:name.familyName, active };
        res.setHeader('ETag', etagFor(row));
        res.status(201).json(row);
      });
  }else if(op==='PATCH' || op==='PUT'){
    const id = String(req.query.id||req.body?.id||'');
    const active = req.body?.active;
    const ifMatch = req.headers['if-match'];
    db.get(`SELECT id, userName, givenName, familyName, active FROM scim_users WHERE id=? AND tenant_id=?`, [id, tenant_id], (e, row)=>{
      if(e) return res.status(500).json({error:'db_error'});
      if(!row) return res.status(404).json({ error:'not_found' });
      if(ifMatch && ifMatch !== etagFor(row)) return res.status(412).json({ error:'precondition_failed' });
      db.run(`UPDATE scim_users SET active=? WHERE id=? AND tenant_id=?`, [active?1:0, id, tenant_id], (e2)=>{
        if(e2) return res.status(500).json({error:'db_error'});
        try{ (registry.counters.scim_mutations_total||{labels:()=>({inc:()=>{}})}).labels('user','update').inc(); }catch(_){}
        appendAudit({ tenant_id, action:'scim_update_user', target:id, details:{ active } });
        const updated = { ...row, active };
        res.setHeader('ETag', etagFor(updated));
        res.json({ id, active });
      });
    });
  }else if(op==='DELETE'){
    const id = String(req.query.id||'');
    db.run(`UPDATE scim_users SET active=0 WHERE id=? AND tenant_id=?`, [id, tenant_id], (e)=>{
      if(e) return res.status(500).json({error:'db_error'});
      try{ (registry.counters.scim_mutations_total||{labels:()=>({inc:()=>{}})}).labels('user','delete').inc(); }catch(_){}
      appendAudit({ tenant_id, action:'scim_delete_user', target:id });
      res.status(204).end();
    });
  }else{
    res.status(405).json({error:'method_not_allowed', schemas:["urn:ietf:params:scim:api:messages:2.0:Error"]});
  }
}
