import sqlite3 from 'sqlite3';
import path from 'path';

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');
const memory = new Map();

function withDb(cb){
  const db = new sqlite3.Database(DB_PATH);
  db.serialize(()=>cb(db));
  db.close();
}

export function recordFeedback({user_id, signal_id, type, action}){
  const per = memory.get(user_id) || { acted:new Map(), ignored:new Map(), snoozed:new Map() };
  const m = per[action] || per.ignored;
  m.set(type, (m.get(type)||0)+1);
  memory.set(user_id, per);
}

export function adjustScoreByLearning({user_id, signal_type, baseScore}){
  const per = memory.get(user_id);
  if(!per) return baseScore;
  const acted = per.acted.get(signal_type)||0;
  const ignored = per.ignored.get(signal_type)||0;
  const total = acted + ignored;
  if(total<3) return baseScore;
  const ratio = (acted+0.01)/(total+0.01);
  const delta = (ratio-0.5) * 0.2;
  return Math.max(0, Math.min(1, baseScore + delta));
}

export function persistOverrides(){
  withDb(db=>{
    db.run(`CREATE TABLE IF NOT EXISTS user_goals(
      user_id TEXT NOT NULL, role TEXT, kpi_name TEXT, target_value REAL,
      stakeholder_tags TEXT, weights_override TEXT, updated_at TEXT,
      PRIMARY KEY(user_id, kpi_name)
    )`);
    for(const [userId, per] of memory.entries()){
      const override = {};
      for(const [t,n] of per.acted.entries()){ override[t] = (override[t]||0) + n; }
      for(const [t,n] of per.ignored.entries()){ override[t] = (override[t]||0) - n; }
      const json = JSON.stringify(override);
      const stmt = db.prepare(`INSERT INTO user_goals(user_id,kpi_name,weights_override,updated_at) VALUES(?,?,?,datetime('now'))
        ON CONFLICT(user_id,kpi_name) DO UPDATE SET weights_override=excluded.weights_override, updated_at=datetime('now')`);
      stmt.run([userId,'learning', json]);
      stmt.finalize();
    }
  });
}
