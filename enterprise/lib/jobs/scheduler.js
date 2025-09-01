'use strict';
/**
 * Simple scheduler to iterate tenants and connectors and trigger incremental syncs.
 * Respects circuit breaker env and concurrency limits. Emits metrics.
 */
const os = require('os');
const pLimit = require('p-limit');
const { getTenants } = require('../tenant'); // assumed helper that lists tenants
const connectors = require('../connectors');
const metrics = require('../metrics/registry');
const breakerOpen = () => process.env.WB_BREAKER_OPEN === 'true';

const DEFAULT_INTERVAL_MS = parseInt(process.env.SCHEDULER_INTERVAL_MS || '60000', 10);
const CONCURRENCY = parseInt(process.env.SCHEDULER_CONCURRENCY || String(Math.max(2, os.cpus().length/2|0)), 10);

async function runOnce(){
  const start = Date.now();
  if (breakerOpen()){
    console.warn('[scheduler] breaker open; skipping cycle');
    metrics?.counters?.scheduler_skipped?.inc?.();
    return;
  }
  const tenants = await getTenants();
  const limit = pLimit(CONCURRENCY);
  const jobs = [];
  for (const tenant of tenants){
    for (const c of connectors.list()){
      jobs.push(limit(async () => {
        const t0 = Date.now();
        try {
          await connectors.withIncrementalSync(c, tenant);
          metrics?.histograms?.connector_sync_latency?.observe?.((Date.now()-t0)/1000);
              metrics?.gauges?.connector_last_success_ts?.set?.({ connector: c.name, tenant }, Math.floor(Date.now()/1000));
          metrics?.counters?.connector_sync_success?.inc?.({ connector: c.name, tenant });
        } catch (err){
          console.error('[scheduler] sync failed', c.name, tenant, err);
          metrics?.counters?.connector_sync_failure?.inc?.({ connector: c.name, tenant });
        }
      }));
    }
  }
  await Promise.all(jobs.map(j => j()));
  metrics?.histograms?.scheduler_cycle_latency?.observe?.((Date.now()-start)/1000);
}

function start(intervalMs = DEFAULT_INTERVAL_MS){
  console.log('[scheduler] starting, interval=', intervalMs, 'ms, concurrency=', CONCURRENCY);
  runOnce().catch(()=>{});
  const id = setInterval(()=> runOnce().catch(()=>{}), intervalMs);
  return () => clearInterval(id);
}

module.exports = { start, runOnce };

import { runAdminConsentTimeoutCheck } from './alerts/adminConsentTimeout.js';
setInterval(()=>{ runAdminConsentTimeoutCheck().catch(()=>{}); }, 3600000);
