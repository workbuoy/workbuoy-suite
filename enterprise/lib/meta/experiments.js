// lib/meta/experiments.js
import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { auditLog } from '../audit.js';
import { assertAutonomyAllowed } from '../secure-policy.js';
import { getSloSnapshot } from './metrics.js';
import { rollbackExperiment, promoteExperiment } from './rollback-gate.js';

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');
const watchers = new Map(); // experimentId -> intervalId

function withDb(cb){
  const db = new sqlite3.Database(DB_PATH);
  return new Promise((resolve,reject)=> cb(db, resolve, reject)).finally(()=> db.close());
}

function readJson(s, def=null){ try{ return s ? JSON.parse(s) : def; }catch{ return def; } }

export async function startExperiment({ name, goal, sla_target, variants=[], prometheus={}, actor='system' }){
  assertAutonomyAllowed();
  const slaJson = JSON.stringify(sla_target||{});
  const id = await withDb((db, resolve, reject)=>{
    db.run(`INSERT INTO experiments(name, goal, sla_target, status) VALUES(?,?,?, 'running')`,
      [name, goal||'', slaJson],
      function(err){ if(err) reject(err); else resolve(this.lastID); });
  });
  await auditLog(actor, 'experiment.start', String(id), { name, goal, sla_target, variants });
  // Optionally start a live watcher for auto-rollback
  if(prometheus && prometheus.baseUrl){
    const intervalMs = Math.max(10_000, prometheus.intervalMs || 30_000);
    const watcher = setInterval(async () => {
      try{
        const slo = await getSloSnapshot({
          baseUrl: prometheus.baseUrl,
          experimentId: id,
          latencyQuery: prometheus.queryLatency,
          errorRateQuery: prometheus.queryErrorRate
        });
        const target = sla_target || {};
        if((target.p95_latency_ms && slo.p95_latency_ms && slo.p95_latency_ms > target.p95_latency_ms) ||
           (typeof target.error_rate_threshold === 'number' && slo.error_rate !== null && slo.error_rate > target.error_rate_threshold)){
          clearInterval(watcher);
          watchers.delete(id);
          await markStatus(id, 'rolled_back');
          await rollbackExperiment(id, `Auto-rollback: SLA violated (p95=${slo.p95_latency_ms}ms, err=${slo.error_rate})`);
          await auditLog(actor, 'experiment.rollback', String(id), { reason: 'sla_violation', slo, target });
        }
      }catch(e){
        // Log but do not crash the watcher
        console.error('Watcher error', e);
      }
    }, intervalMs);
    watchers.set(id, watcher);
  }
  return id;
}

export async function stopExperiment({ id, actor='system', prometheus={} }){
  assertAutonomyAllowed();
  await markStatus(id, 'stopped');
  await auditLog(actor, 'experiment.stop', String(id), {});
  // Evaluate and promote/rollback
  let outcome = 'promoted';
  try{
    if(prometheus && prometheus.baseUrl){
      const slo = await getSloSnapshot({
        baseUrl: prometheus.baseUrl,
        experimentId: id,
        latencyQuery: prometheus.queryLatency,
        errorRateQuery: prometheus.queryErrorRate
      });
      const exp = await getExperiment(id);
      const target = readJson(exp.sla_target, {});
      if((target.p95_latency_ms && slo.p95_latency_ms && slo.p95_latency_ms > target.p95_latency_ms) ||
         (typeof target.error_rate_threshold === 'number' && slo.error_rate !== null && slo.error_rate > target.error_rate_threshold)){
        outcome = 'rolled_back';
        await rollbackExperiment(id, 'SLA violation at stop');
      }else{
        await promoteExperiment(id);
      }
      await auditLog(actor, `experiment.${outcome}`, String(id), { slo, target });
    }else{
      await promoteExperiment(id);
      await auditLog(actor, 'experiment.promoted', String(id), { reason: 'no_prometheus_provided' });
    }
  }finally{
    await markStatus(id, outcome);
    const w = watchers.get(id);
    if(w){ clearInterval(w); watchers.delete(id); }
  }
  return { id, outcome };
}

export async function getExperiment(id){
  return await withDb((db, resolve, reject)=>{
    db.get(`SELECT * FROM experiments WHERE id=?`, [id], (err,row)=> err?reject(err):resolve(row));
  });
}

export async function summarizeMetrics(id){
  // Aggregate simple stats from experiment_events + status
  const [rows, exp] = await Promise.all([
    withDb((db, resolve, reject)=>{
      db.all(`SELECT metric, value FROM experiment_events WHERE experiment_id=?`, [id],
        (err, rows)=> err?reject(err):resolve(rows||[]));
    }),
    getExperiment(id)
  ]);
  const byMetric = {};
  for(const r of rows){
    const arr = byMetric[r.metric] || (byMetric[r.metric]=[]);
    arr.push(r.value);
  }
  function p95(values){
    if(!values.length) return null;
    const a = values.slice().sort((x,y)=>x-y);
    const idx = Math.ceil(0.95*a.length)-1;
    return a[Math.max(0, idx)];
  }
  const summary = {};
  for(const [metric, values] of Object.entries(byMetric)){
    const avg = values.reduce((s,v)=>s+v,0)/values.length;
    summary[metric] = { count: values.length, avg, p95: p95(values) };
  }
  return { experiment: exp, events_summary: summary };
}

async function markStatus(id, status){
  return await withDb((db, resolve, reject)=>{
    db.run(`UPDATE experiments SET status=? WHERE id=?`, [status, id], (err)=> err?reject(err):resolve());
  });
}

// Thin wrapper to existing rollback module to avoid circular deps
export async function rollbackExperiment(id, reason){
  const mod = await import('./rollback.js'); // existing project file
  if(mod && typeof mod.createSnapshot === 'function' && typeof mod.restoreSnapshot === 'function'){
    // Here "rollback" can be implemented as "restore last snapshot"
    const snaps = mod.listSnapshots();
    if(snaps && snaps.length){
      await mod.restoreSnapshot(snaps[snaps.length-1].path);
    }
  }
  // Additional domain-specific rollback could be placed here
  return true;
}

export async function promoteExperiment(id){
  // No-op placeholder: in real system, this might flip a feature flag or merge config
  return true;
}
