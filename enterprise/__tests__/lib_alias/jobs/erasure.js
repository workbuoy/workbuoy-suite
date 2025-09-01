import path from 'path'; import sqlite3 from 'sqlite3';
import { wbErasureJobTotal, wbErasureJobDuration } from '../metrics/registry.js';
const DB_PATH=process.env.DB_PATH||path.join(process.cwd(),'db','workbuoy.db');

function now(){ return new Date().toISOString(); }

export async function performErasure(tenant_id){
  const start = Date.now();
  const db=new sqlite3.Database(DB_PATH);
  const exec = (sql, params=[])=> new Promise((resolve)=> db.run(sql, params, ()=> resolve()));
  const del = async (table)=> exec(`DELETE FROM ${table} WHERE tenant_id=?`, [tenant_id]);
  const maskAudit = async ()=> exec(`UPDATE audit_logs_worm SET details='[erased]' WHERE tenant_id=?`, [tenant_id]);
  const stats = {};
  const tables = ['org_users','secrets','tenant_connectors','usage_counters','subscriptions','kb_documents','ai_feedback','tickets','ai_actions_log','ai_tasks','usage_events','connector_state'];
  for(const t of tables){ await del(t); stats[t]='deleted'; }
  await maskAudit();
  await exec(`DELETE FROM tenants WHERE id=?`, [tenant_id]);
  db.close();
  const dur = Math.round((Date.now()-start)/1000);
  try{ wbErasureJobTotal.labels('done').inc(); wbErasureJobDuration.labels(tenant_id).set(dur); }catch(_){}
  return { duration_sec: dur, stats };
}
