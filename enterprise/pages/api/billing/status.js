import path from 'path'; import sqlite3 from 'sqlite3';
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');

export default function handler(req,res){
  const auth = req.headers.authorization || '';
  const m = auth.match(/^Bearer\s+(.+)$/i); if(!m) return res.status(401).json({error:'missing_token'});
  const payload = require('../../../lib/auth.js').verifyToken(m[1]); if(!payload) return res.status(401).json({error:'invalid_token'});
  const tenant_id = payload.tenant_id;

  const db = new sqlite3.Database(DB_PATH);
  db.serialize(()=>{
    db.get(`SELECT plan,status,current_period_end FROM subscriptions WHERE tenant_id=? ORDER BY id DESC LIMIT 1`, [tenant_id], (e,sub)=>{
      const plan = sub?.plan || 'Solo Pro';
      const status = sub?.status || 'trialing';
      db.all(`SELECT day,count FROM usage_counters WHERE tenant_id=? AND counter_name='events' AND day>=date('now','-6 days') ORDER BY day`, [tenant_id], (e2,rows)=>{
        const today = rows.find(r=>r.day===new Date().toISOString().slice(0,10))?.count||0;
        const week = rows.reduce((a,x)=>a+(x.count||0),0);
        const limits = { 'Solo Pro': { events_per_day:5000 }, 'Team': { events_per_day:20000 }, 'Business': { events_per_day:100000 } };
        res.json({ plan, status, today, week, nextRenewal: sub?.current_period_end||null, limits: limits[plan]||{} });
        db.close();
      });
    });
  });
}
