import sqlite3 from 'sqlite3';
import path from 'path';
import { scoreSignal } from '../../../lib/signals.score.js';
import { adjustScoreByLearning } from '../../../lib/signals.learning.js';

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');

function withDb(cb){
  const db = new sqlite3.Database(DB_PATH);
  db.serialize(()=>cb(db));
  db.close();
}

function getUserGoals(user_id){
  return new Promise(resolve=>{
    withDb(db=>{
      db.get(`SELECT * FROM user_goals WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1`, [user_id], (err,row)=> resolve(row||null));
    });
  });
}

export default async function handler(req,res){
  const user_id = (req.headers['x-user-id'] || 'demo').toString();
  const goals = await getUserGoals(user_id);
  const since = (req.query.since || 'visit');
  const context_entity = req.query.entity || null;
  const focus_tab = req.query.tab || null;

  const signals = await listSignals(100);
  const enriched = [];
  for(const s of signals){
    const signal = { id: s.id, type:s.type, title:s.title, payload: JSON.parse(s.payload||'{}') };
    if(context_entity && signal.payload && (signal.payload.account_id === context_entity || signal.payload.customer_id === context_entity)){
      signal.payload.context_match = 0.2;
    }
    let sc = scoreSignal({signal, user:{id:user_id}, goals});
    sc = adjustScoreByLearning({user_id, signal_type: signal.type, baseScore: sc});
    const why = buildWhy({signal, goals, context_entity, focus_tab});
    const time_hint = (signal.payload && signal.payload.time_hint) || null;
    enriched.push({ id: signal.id, type: signal.type, title: signal.title, score: round2(sc), since, why, time_hint });
  }

  const top = enriched.filter(e=>e.score>=0.5).sort((a,b)=>b.score-a.score).slice(0,10);
  res.json({ ok:true, data: top });
}

function listSignals(limit=100){
  return new Promise(resolve=>{
    withDb(db=> db.all(`SELECT * FROM signals ORDER BY id DESC LIMIT ?`, [limit], (err,rows)=> resolve(rows||[])));
  });
}

function buildWhy({signal, goals, context_entity, focus_tab}){
  const why = [];
  if(goals && goals.role) why.push('role:'+goals.role.split(' ').map(x=>x[0]).join(''));
  if(goals && goals.kpi_name) why.push('kpi:'+goals.kpi_name);
  if(context_entity && signal.payload && (signal.payload.account_id===context_entity || signal.payload.customer_id===context_entity)){
    why.push('context:'+context_entity);
  }
  if(signal.payload && signal.payload.time_hint) why.push('time:'+signal.payload.time_hint);
  return why;
}

function round2(x){ return Math.round(x*100)/100; }
