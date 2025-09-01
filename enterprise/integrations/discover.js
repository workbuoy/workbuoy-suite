import sqlite3 from 'sqlite3';
import path from 'path';

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');

function withDb(cb){
  const db = new sqlite3.Database(DB_PATH);
  db.serialize(()=>cb(db));
  db.close();
}

function saveScan(user_id, snapshot){
  withDb(db=>{
    db.run(`CREATE TABLE IF NOT EXISTS last_seen(
      user_id TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      snapshot TEXT,
      last_seen_ts TEXT DEFAULT (datetime('now')),
      PRIMARY KEY(user_id, entity_type, entity_id)
    )`);
    const stmt = db.prepare(`INSERT INTO last_seen(user_id,entity_type,entity_id,snapshot,last_seen_ts)
      VALUES(?,?,?,?,datetime('now'))
      ON CONFLICT(user_id, entity_type, entity_id) DO UPDATE SET snapshot=excluded.snapshot, last_seen_ts=datetime('now')`);
    stmt.run([user_id,'integration_scan',user_id, JSON.stringify(snapshot||{})]);
    stmt.finalize();
  });
}

export default async function handler(req,res){
  const user_id = (req.headers['x-user-id'] || 'demo').toString();
  if(req.method!=='POST'){
    res.status(405).json({ok:false,error:'Method not allowed'}); return;
  }
  try{
    const body = req.body || {};
    const email = (body.email||'').toString();
    const email_domain = email.includes('@') ? email.split('@').pop() : (req.headers['x-email-domain']||'').toString();
    const ua = (req.headers['user-agent']||'').toLowerCase();
    const found = Array.isArray(body.found) ? body.found : [];
    const heuristic = [];
    if(email_domain.includes('gmail') || email_domain.includes('google')) heuristic.push({vendor:'google',product:'workspace'});
    if(email_domain.includes('outlook') || email_domain.includes('microsoft') || email_domain.includes('live') || email_domain.includes('office')) heuristic.push({vendor:'microsoft',product:'m365'});
    if(ua.includes('electron')) heuristic.push({vendor:'slack',product:'slack'});
    const snapshot = { email_domain, found: [...found, ...heuristic] };
    saveScan(user_id, snapshot);
    res.json({ok:true, data: snapshot});
  }catch(e){
    res.status(500).json({ok:false, error: e.message});
  }
}
