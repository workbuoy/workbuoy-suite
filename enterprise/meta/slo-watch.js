
let timer = null;
function poll() {
  // In a real system we'd query Prometheus; here, use globals
  const active = global.wb_experiment_active || {};
  for (const id of Object.keys(active)) {
    const p95 = global.simulated_p95_latency_ms || 0;
    const err = global.simulated_error_rate || 0;
    const SLA = global.simulated_sla_ms || 0;
    const ERR_MAX = global.simulated_error_rate_max || 1.0;
    if ((SLA && p95 > SLA) || (err > ERR_MAX)) {
      try {
        require('./rollback').run(Number(id));
      } catch (e) {}
      global.wb_experiment_rollback_total = (global.wb_experiment_rollback_total || 0) + 1;
      delete active[id];
    }
  }
}
function ensure() {
  if (timer) return;
  timer = setInterval(poll, 5_000);
}
module.exports = { ensure, poll };
