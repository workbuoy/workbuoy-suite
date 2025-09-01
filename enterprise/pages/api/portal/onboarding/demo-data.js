import path from 'path';
import fs from 'fs';
import sqlite3 from 'sqlite3';
import { appendAudit } from '../../../../lib/audit/store.js';
import registry from '../../../../lib/metrics/registry.js';

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');
const DEMO_JSON = path.join(process.cwd(), 'public', 'data', 'demo-dataset.json');

function ensureColumns(db, cb){
  db.run(`ALTER TABLE tenant_settings ADD COLUMN demo_dataset_enabled INTEGER DEFAULT 0`, ()=>{
    db.run(`ALTER TABLE tenant_settings ADD COLUMN features TEXT DEFAULT '{}'`, ()=> cb());
  });
}

export default function handler(req, res){
  const tenant_id = req.headers['x-tenant-id'] || 'demo-tenant';
  const db = new sqlite3.Database(DB_PATH);
  if(req.method === 'POST'){
    const enable = String(req.query.enable||'1') !== '0';
    const upsert = () => {
      db.run(`INSERT INTO tenant_settings(tenant_id, demo_dataset_enabled) VALUES(?, ?)
              ON CONFLICT(tenant_id) DO UPDATE SET demo_dataset_enabled=excluded.demo_dataset_enabled`,
             [tenant_id, enable?1:0], (e)=>{
        if(e){ res.status(500).json({ ok:false, error:'db_error' }); return; }
        try{ (registry.counters.demo_dataset_enabled_total||{inc:()=>{}}).inc(); }catch(_){}
        appendAudit({ tenant_id, user_id: req.headers['x-user-id']||null, action:'demo_data_toggle', target:'demo-dataset', details:{ enabled:enable } });
        res.json({ ok:true, demo_dataset_enabled: enable });
      });
    };
    db.get(`SELECT demo_dataset_enabled FROM tenant_settings WHERE tenant_id=?`, [tenant_id], (err)=>{
      if(err){ ensureColumns(db, upsert); } else { upsert(); }
    });
  }else if(req.method === 'GET'){
    try{
      const raw = fs.readFileSync(DEMO_JSON, 'utf-8');
      const data = JSON.parse(raw);
      res.json({ ok:true, data });
    }catch(e){
      res.status(500).json({ ok:false, error:'demo_json_not_found' });
    }
  }else{
    res.status(405).json({ ok:false, error:'method_not_allowed' });
  }
}
