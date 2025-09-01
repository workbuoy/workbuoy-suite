import sqlite3 from 'sqlite3';
import path from 'path';
import { wbFeedbackVerifiedRatio, wbSignalsMutedTotal, observeScoringP95, httpRequests } from './metrics.js';
import { ENABLE_VERIFIED_LEARNING } from '../../lib/flags.js';

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');

function withDb(cb){
  const db = new sqlite3.Database(DB_PATH);
  db.serialize(()=>cb(db));
  db.close();
}

// Simple token-bucket style in-memory limiter per-process + daily DB cap
const buckets = new Map(); // key=user, value={tokens, refillTs}
const RATE_PER_MIN = 10;
function takeToken(user){
  const now = Date.now();
  const state = buckets.get(user) || { tokens: RATE_PER_MIN, refillTs: now };
  if(now - state.refillTs >= 60_000){
    state.tokens = RATE_PER_MIN;
    state.refillTs = now;
  }
  if(state.tokens <= 0) { buckets.set(user, state); return false; }
  state.tokens -= 1;
  buckets.set(user, state);
  return true;
}

export default function handler(req,res){
  const start = Date.now();
  if(req.method!=='POST'){ res.status(405).end(); return; }
  const user = (req.headers['x-user-email'] || req.body?.user || '').toString();
  if(!user){ res.status(400).json({error:'missing_user'}); return; }

  // per-minute token bucket
  if(!takeToken(user)){
    res.status(429).json({ error:"rate_limited", retry_in_seconds: 120 });
    return;
  }

  const payload = req.body||{};
  const actionType = payload.action_type || payload.actionType || null;

  withDb(db=>{
    db.run(`CREATE TABLE IF NOT EXISTS usage_events(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ts TEXT DEFAULT (datetime('now')),
      user_email TEXT, event_name TEXT, module TEXT, metadata TEXT
    )`);

    // Daily cap: 50/day per user (DB authoritative, transaction-safe)
    db.get(`SELECT COUNT(1) AS c FROM usage_events WHERE event_name='feedback' AND user_email=? AND ts > datetime('now','start of day')`, [user], (err,row)=>{
      if(err){ res.status(500).json({error:'db_error'}); return; }
      if((row?.c||0) >= 50){
        res.status(429).json({ error:"rate_limited", retry_in_seconds: 24*60*60 });
        return;
      }
      const meta = JSON.stringify({ ...(payload||{}), verified_action: false });
      db.run(`INSERT INTO usage_events(user_email,event_name,module,metadata) VALUES(?,?,?,?)`, [user,'feedback','cxm',meta], function(e){
        if(e){ res.status(500).json({error:'db_error'}); return; }
        const ms = Date.now()-start;
        try { observeScoringP95(ms); } catch {}
        res.json({ ok:true, id:this.lastID, verified_learning: ENABLE_VERIFIED_LEARNING });
      });
    });
  });
}
