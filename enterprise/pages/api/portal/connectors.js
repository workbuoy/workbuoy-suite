import path from 'path'; import sqlite3 from 'sqlite3';
import { verifyToken } from '../../../lib/auth.js';
import { putSecret } from '../../../lib/secrets/index.js';
import { recordQuotaViolation } from '../../../lib/metrics/registry.js';

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');
const AVAILABLE = [
  { provider:'email', name:'E-post' },
  { provider:'slack', name:'Slack' },
  { provider:'drive', name:'Google Drive' },
];

export default async function handler(req,res){
  const auth = req.headers.authorization||''; const m = auth.match(/^Bearer\s+(.+)$/i);
  if(!m) return res.status(401).json({error:'missing_token'});
  const user = verifyToken(m[1]); if(!user) return res.status(401).json({error:'invalid_token'});
  const tenant = user.tenant_id;
  const db = new sqlite3.Database(DB_PATH);

  if(req.method==='GET'){
    db.all(`SELECT provider,enabled,COALESCE(status,'pending') as status,last_sync_at,secret_ref FROM tenant_connectors WHERE tenant_id=?`, [tenant], (e,rows)=>{
      const map = Object.fromEntries(rows?.map(r=>[r.provider,r])||[]);
      const list = AVAILABLE.map(a=> ({ ...a, enabled: !!map[a.provider]?.enabled, status: map[a.provider]?.status || 'pending' }));
      res.json({ connectors: list });
      db.close();
    });
  } else if (req.method==='POST'){
    const { provider, action, secrets } = req.body||{};
    if(!provider) { db.close(); return res.status(400).json({error:'missing_provider'}); }
    // Quota check on enable
    if(action==='enable'){
      const planRow = await new Promise(r=>db.get(`SELECT plan FROM subscriptions WHERE tenant_id=? ORDER BY id DESC LIMIT 1`, [tenant], (e,row)=>r(row)));
      const plan = planRow?.plan || 'Solo Pro';
      const limits = { 'Solo Pro':2, 'Team':6, 'Business':15 };
      const max = limits[plan] || 2;
      const cnt = await new Promise(r=>db.get(`SELECT COUNT(*) as c FROM tenant_connectors WHERE tenant_id=? AND enabled=1`, [tenant], (e,row)=>r(row?.c||0)));
      if(cnt >= max){
        recordQuotaViolation(tenant, 'connectors_max');
        db.close(); return res.status(403).json({ error:'connectors_limit', message:'Du har nådd grensen for integrasjoner i planen din.' });
      }
    }
    // Save secrets to backend (store ref)
    let secretRef = null;
    if(secrets && typeof secrets === 'object'){
      for(const [k,v] of Object.entries(secrets)){
        secretRef = await putSecret(tenant, `${provider}.${k}`, v);
      }
    }
    await new Promise(r=>db.run(`INSERT OR IGNORE INTO tenant_connectors(tenant_id,provider,enabled) VALUES(?,?,0)`, [tenant,provider], ()=>r()));
    if(action==='enable'){
      await new Promise(r=>db.run(`UPDATE tenant_connectors SET enabled=1, status='pending', secret_ref=? , updated_at=datetime('now') WHERE tenant_id=? AND provider=?`, [secretRef,tenant,provider], ()=>r()));
      await audit(db, tenant, 'connector_enable', provider, user.email);
      res.json({ ok:true, provider, enabled:true, secret_ref: secretRef });
    } else if (action==='disable'){
      await new Promise(r=>db.run(`UPDATE tenant_connectors SET enabled=0, status='disabled', updated_at=datetime('now') WHERE tenant_id=? AND provider=?`, [tenant,provider], ()=>r()));
      await audit(db, tenant, 'connector_disable', provider, user.email);
      res.json({ ok:true, provider, enabled:false });
    } else {
      res.status(400).json({ error:'invalid_action' });
    }
    db.close();
  } else {
    db.close();
    res.status(405).json({error:'method_not_allowed'});
  }
}

function audit(db, tenant, action, provider, actor){
  return new Promise((resolve)=> db.run(`INSERT INTO audit_logs_worm(category, action, actor, target, tenant_id, created_at) VALUES(?,?,?,?,?, datetime('now'))`, ['connector', action, actor||'', provider||'', tenant||''], ()=>resolve()));
}
