import path from 'path'; import sqlite3 from 'sqlite3';
import { verifyToken } from '../../../../lib/auth.js';
import { recordConnectorSync2 } from '../../../../lib/metrics/registry.js';

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'method_not_allowed'});
  const auth = req.headers.authorization||''; const m = auth.match(/^Bearer\s+(.+)$/i);
  if(!m) return res.status(401).json({error:'missing_token'});
  const user = verifyToken(m[1]); if(!user) return res.status(401).json({error:'invalid_token'});
  const tenant = user.tenant_id;
  const { provider } = req.body||{}; if(!provider) return res.status(400).json({error:'missing_provider'});

  const db = new sqlite3.Database(DB_PATH);
  // Simulate a quick sync and mark as connected
  await new Promise(r=>db.run(`UPDATE tenant_connectors SET status='connected', last_sync_at=datetime('now'), updated_at=datetime('now') WHERE tenant_id=? AND provider=?`, [tenant,provider], ()=>r()));
  recordConnectorSync2(tenant, provider, 'ok');
  await new Promise(r=>db.run(`INSERT INTO audit_logs_worm(category, action, actor, target, tenant_id, created_at) VALUES('connector','sync','system',?, ?, datetime('now'))`, [provider, tenant], ()=>r()));
  db.close();
  res.json({ ok:true, provider, status:'connected' });
}
