
// ESM singleton Prometheus registry for the whole app
import client from 'prom-client';

let _registry = null;

export function getRegistry() {
  if (_registry) return _registry;
  _registry = new client.Registry();
  client.collectDefaultMetrics({ register: _registry, prefix: 'wb_' });
  return _registry;
}

// --- Connector metrics ---
const reg = getRegistry();

export const connectorSyncTotal = new client.Counter({
  name: 'wb_connector_sync_total',
  help: 'Successful connector syncs',
  labelNames: ['connector'],
  registers: [reg],
});
export const connectorErrTotal = new client.Counter({
  name: 'wb_connector_err_total',
  help: 'Connector sync errors',
  labelNames: ['connector'],
  registers: [reg],
});
export const connectorP95 = new client.Gauge({
  name: 'wb_connector_p95_ms',
  help: 'p95 sync latency (ms) per connector',
  labelNames: ['connector'],
  registers: [reg],
});
export const circuitOpens = new client.Counter({
  name: 'wb_circuit_opens_total',
  help: 'Circuit breaker open events',
  labelNames: ['connector'],
  registers: [reg],
});

// --- Other app metrics ---
export const feedbackVerifiedRatio = new client.Gauge({
  name: 'wb_feedback_verified_ratio',
  help: 'Ratio of verified feedback items',
  registers: [reg],
});
export const scoringP95 = new client.Gauge({
  name: 'wb_scoring_p95_ms',
  help: 'p95 scoring latency',
  registers: [reg],
});

// --- Scheduler metrics ---
export const schedulerRuns = new client.Counter({
  name: 'wb_scheduler_runs_total',
  help: 'Scheduler loop runs',
  registers: [reg],
});
export const schedulerErrors = new client.Counter({
  name: 'wb_scheduler_errors_total',
  help: 'Scheduler loop errors',
  registers: [reg],
});

// --- Search metrics (to ensure same registry) ---
export const searchReqTotal = new client.Counter({
  name: 'wb_search_req_total',
  help: 'Search requests',
  registers: [reg],
});
export const searchErrTotal = new client.Counter({
  name: 'wb_search_err_total',
  help: 'Search request errors',
  registers: [reg],
});
export const searchLatencyP95 = new client.Gauge({
  name: 'wb_search_latency_p95_ms',
  help: 'p95 search latency (ms)',
  registers: [reg],
});

// --- Helper functions ---
export function recordConnectorSuccess(name, p95ms) {
  connectorSyncTotal.labels(name).inc();
  if (typeof p95ms === 'number') connectorP95.labels(name).set(p95ms);
}
export function recordConnectorError(name) {
  connectorErrTotal.labels(name).inc();
}
export function recordCircuitOpen(name) {
  circuitOpens.labels(name).inc();
}
export function setFeedbackVerifiedRatio(v) {
  feedbackVerifiedRatio.set(v);
}
export function setScoringP95(v) {
  scoringP95.set(v);
}

export const schedulerLastRunTs = new client.Gauge({ name: 'wb_scheduler_last_run_ts', help: 'Unix epoch seconds of last scheduler run', registers: [getRegistry()] });
