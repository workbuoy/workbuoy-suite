import { requireAuth } from '../../../../lib/auth.js';
import { auditLog } from '../../../../lib/audit.js';
import sqlite3 from 'sqlite3';
import path from 'path';

export default async function handler(req,res){
  const user = requireAuth(req,res); if(!user) return;
  if(req.method!=='POST') return res.status(405).json({error:'method_not_allowed'});

  // Feature flag
  const enabled = (process.env.TSUNAMI_WRITEBACK_ENABLED || 'false').toLowerCase() === 'true';
  if(!enabled) return res.status(403).json({error:'writeback_disabled'});

  const { approvals=[], plan=[] } = req.body || {};
  const required = ['privacy_sensitive','write_system_high_risk'];
  const ok = required.every(id => approvals.includes(id));
  if(!ok) return res.status(400).json({error:'missing_required_approvals', required});

  const db = new sqlite3.Database(path.join(process.cwd(),'db','workbuoy.db'));
  db.serialize(()=>{
    db.run(`CREATE TABLE IF NOT EXISTS crm_notes(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_email TEXT, body TEXT, created_ts TEXT DEFAULT (datetime('now'))
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS project_tasks(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_email TEXT, title TEXT, created_ts TEXT DEFAULT (datetime('now'))
    )`);

    let writes=0;
    for(const step of plan){
      if(step.target === 'crm.note'){
        db.run(`INSERT INTO crm_notes(user_email, body) VALUES(?,?)`, [user.email, step.data?.body||'']);
        writes++;
      } else if(step.target === 'projects.task'){
        db.run(`INSERT INTO project_tasks(user_email, title) VALUES(?,?)`, [user.email, step.data?.title||'']);
        writes++;
      }
    }
    auditLog({ user_email:user.email, action:'tsunami_writeback', details:{ writes } });
  });

  res.json({ ok:true, wrote:true });
}
