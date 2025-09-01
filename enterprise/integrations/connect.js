import sqlite3 from 'sqlite3';
import path from 'path';
import { integrationsConnectStarted, integrationsConnected, integrationsFailed } from '../../../lib/metrics/integrations.js';

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');

function withDb(cb){
  const db = new sqlite3.Database(DB_PATH);
  db.serialize(()=>cb(db));
  db.close();
}

function setStatus(user_id, provider, status, meta){
  withDb(db=>{
    db.run(`CREATE TABLE IF NOT EXISTS integrations_status(
      user_id TEXT NOT NULL, provider TEXT NOT NULL, status TEXT NOT NULL, meta TEXT, updated_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY(user_id, provider)
    )`);
    const stmt = db.prepare(`INSERT INTO integrations_status(user_id,provider,status,meta,updated_at)
      VALUES(?,?,?,?,datetime('now'))
      ON CONFLICT(user_id,provider) DO UPDATE SET status=excluded.status, meta=excluded.meta, updated_at=datetime('now')`);
    stmt.run([user_id, provider, status, JSON.stringify(meta||{})]);
    stmt.finalize();
  });
}

export default async function handler(req,res){
  const user_id = (req.headers['x-user-id'] || 'demo').toString();
  if(req.method!=='POST'){
    res.status(405).json({ok:false, error:'Method not allowed'}); return;
  }
  try{
    const { provider } = req.body||{};
    if(!provider){ res.status(400).json({ok:false, error:'Missing provider'}); return; }
    integrationsConnectStarted.labels(provider).inc();
    setStatus(user_id, provider, 'pending', { step:'oauth_start' });
    if(process.env.NODE_ENV !== 'production'){
      setStatus(user_id, provider, 'connected', { demo:true });
      integrationsConnected.labels(provider).inc();
      res.json({ok:true, data:{ provider, status:'connected', demo:true }});
      return;
    }
    res.json({ok:true, data:{ provider, status:'pending' }});
  }catch(e){
    if(e && e.provider){ integrationsFailed.labels(e.provider).inc(); }
    res.status(500).json({ok:false, error: e.message});
  }
}
