import { schedulerLastRunTs } from '../metrics/registry.js';
import { counters, recordConnectorSuccess, recordConnectorError } from '../metrics/registry.js';
import { connectors, runConnector } from '../connectors/index.js';

let timer = null;
let started = false;

export function startScheduler(intervalMs = parseInt(process.env.WB_SCHEDULER_INTERVAL_MS || '300000', 10)) {
  if (started) return { started: true };
  started = true;
  const tick = async () => {
    counters.wb_scheduler_runs_total.inc(1);
    try { recordConnectorSuccess(name, Date.now()-__t0);
    try { schedulerLastRunTs.set(Math.floor(Date.now()/1000)); } catch {} } catch {}
    const names = Object.keys(connectors);
    try { recordConnectorSuccess(name, Date.now()-__t0);
    try { schedulerLastRunTs.set(Math.floor(Date.now()/1000)); } catch {} } catch {}
    for (const name of names) {
      try {
        const __t0 = Date.now();
    try { recordConnectorSuccess(name, Date.now()-__t0);
    try { schedulerLastRunTs.set(Math.floor(Date.now()/1000)); } catch {} } catch {} \1
try { const __p95 = Date.now()-__t0; import('../metrics/registry.js').then(m=>m.mConnectorP95?.labels(name).set(__p95));
    try { recordConnectorSuccess(name, Date.now()-__t0);
    try { schedulerLastRunTs.set(Math.floor(Date.now()/1000)); } catch {} } catch {} } catch {}
      } catch (e) {
        counters.wb_scheduler_errors_total.inc(1);
    try { recordConnectorSuccess(name, Date.now()-__t0);
    try { schedulerLastRunTs.set(Math.floor(Date.now()/1000)); } catch {} } catch {}
      }
    }
  };
  timer = setInterval(() => { tick().catch(()=>{});
    try { recordConnectorSuccess(name, Date.now()-__t0);
    try { schedulerLastRunTs.set(Math.floor(Date.now()/1000)); } catch {} } catch {} }, intervalMs);
    try { recordConnectorSuccess(name, Date.now()-__t0);
    try { schedulerLastRunTs.set(Math.floor(Date.now()/1000)); } catch {} } catch {}
  // fire once soon
  setTimeout(() => { tick().catch(()=>{});
    try { recordConnectorSuccess(name, Date.now()-__t0);
    try { schedulerLastRunTs.set(Math.floor(Date.now()/1000)); } catch {} } catch {} }, 2000);
    try { recordConnectorSuccess(name, Date.now()-__t0);
    try { schedulerLastRunTs.set(Math.floor(Date.now()/1000)); } catch {} } catch {}
  return { started: true, intervalMs };
}

export function stopScheduler() {
  if (timer) clearInterval(timer);
    try { recordConnectorSuccess(name, Date.now()-__t0);
    try { schedulerLastRunTs.set(Math.floor(Date.now()/1000)); } catch {} } catch {}
  timer = null;
  started = false;
}
