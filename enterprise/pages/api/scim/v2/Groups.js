import path from 'path'; import sqlite3 from 'sqlite3';
import { appendAudit } from '../../../../lib/audit/store.js';
import registry from '../../../../lib/metrics/registry.js';
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');

export default async function handler(req,res){
  const tenant_id = req.headers['x-tenant-id'] || 'demo-tenant';
  const db = new sqlite3.Database(DB_PATH);
  const op = req.method;
  if(op==='GET'){
    const startIndex = Math.max(1, parseInt(String(req.query.startIndex||'1'),10) || 1);
    const count = Math.min(1000, Math.max(1, parseInt(String(req.query.count||'100'),10) || 100));
    const offset = startIndex - 1;
    db.all(`SELECT id, displayName FROM scim_groups WHERE tenant_id=? LIMIT ? OFFSET ?`, [tenant_id, count, offset], (e,rows)=>{
      if(e) return res.status(500).json({error:'db_error'});
      res.json({ Resources: rows, startIndex, itemsPerPage: count, totalResults: rows.length, schemas:["urn:ietf:params:scim:api:messages:2.0:ListResponse"] });
    });
  }else if(op==='POST'){
    const id = req.body?.id || `grp_${Date.now()}`;
    const { displayName } = req.body||{};
    db.run(`INSERT INTO scim_groups(id,tenant_id,displayName,raw) VALUES(?,?,?,?)`,
      [id, tenant_id, displayName, JSON.stringify(req.body||{})], (e)=>{
        if(e) return res.status(500).json({error:'db_error'});
        try{ (registry.counters.scim_mutations_total||{labels:()=>({inc:()=>{}})}).labels('group','create').inc(); }catch(_){}
        appendAudit({ tenant_id, action:'scim_create_group', target:id, details:{ displayName } });
        res.status(201).json({ id, displayName });
      });
  }else if(op==='PATCH' || op==='PUT'){
    const id = String(req.query.id||req.body?.id||'');
    const displayName = req.body?.displayName;
    db.run(`UPDATE scim_groups SET displayName=? WHERE id=? AND tenant_id=?`, [displayName, id, tenant_id], (e)=>{
      if(e) return res.status(500).json({error:'db_error'});
      try{ (registry.counters.scim_mutations_total||{labels:()=>({inc:()=>{}})}).labels('group','update').inc(); }catch(_){}
      appendAudit({ tenant_id, action:'scim_update_group', target:id, details:{ displayName } });
      res.json({ id, displayName });
    });
  }else if(op==='DELETE'){
    const id = String(req.query.id||'');
    db.run(`DELETE FROM scim_groups WHERE id=? AND tenant_id=?`, [id, tenant_id], (e)=>{
      if(e) return res.status(500).json({error:'db_error'});
      try{ (registry.counters.scim_mutations_total||{labels:()=>({inc:()=>{}})}).labels('group','delete').inc(); }catch(_){}
      appendAudit({ tenant_id, action:'scim_delete_group', target:id });
      res.status(204).end();
    });
  }else{
    res.status(405).json({error:'method_not_allowed', schemas:["urn:ietf:params:scim:api:messages:2.0:Error"]});
  }
}
