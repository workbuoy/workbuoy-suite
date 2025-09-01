// lib/metrics.js
// Prometheus-style metrics helper for serverless/Node processes.

const counters = new Map(); // name{labels}->value
const gauges = new Map();   // name{labels}->value

function counterKey(name, labels) {
  if (!labels || Object.keys(labels).length === 0) return name;
  const parts = Object.entries(labels).sort(([a],[b]) => a.localeCompare(b)).map(([k,v]) => `${k}="${String(v)}"`);
  return `${name}{${parts.join(',')}}`;
}

function increment(name, labels = {}, delta = 1) {
  const key = counterKey(name, labels);
  counters.set(key, (counters.get(key) || 0) + delta);
}

function setGauge(name, labels = {}, value) {
  const key = counterKey(name, labels);
  gauges.set(key, value);
}

function observe(name, labels = {}, value) {
  const sumKey = counterKey(name + '_sum', labels);
  const cntKey = counterKey(name + '_count', labels);
  counters.set(sumKey, (counters.get(sumKey) || 0) + value);
  counters.set(cntKey, (counters.get(cntKey) || 0) + 1);
}

// Convenience wrappers
function pgObserveLatencyMs(ms, op='query'){ observe('wb_pg_query_duration_ms', {op}, ms); }
function kmsIncrement(op='op', ok=true){ increment(ok ? 'wb_kms_ops_total' : 'wb_kms_errors_total', {op}); }
function setBackupSuccess(tsMs){ setGauge('wb_backup_last_success_timestamp',{}, Math.floor(tsMs/1000)); }

function getMetricsText() {
  const lines = [];
  // Declare known metrics metadata
  lines.push('# HELP wb_connector_errors_total Count of connector errors by connector');
  lines.push('# TYPE wb_connector_errors_total counter');
  lines.push('# HELP wb_pg_query_duration_ms Summary of PG query durations in ms');
  lines.push('# TYPE wb_pg_query_duration_ms summary');
  lines.push('# HELP wb_kms_ops_total Total KMS operations by op');
  lines.push('# TYPE wb_kms_ops_total counter');
  lines.push('# HELP wb_kms_errors_total KMS errors by op');
  lines.push('# TYPE wb_kms_errors_total counter');
  lines.push('# HELP wb_backup_last_success_timestamp Last successful backup time (unix seconds)');
  lines.push('# TYPE wb_backup_last_success_timestamp gauge');

  // Emit counters
  for (const [key, value] of counters.entries()) {
    lines.push(`${key} ${value}`);
  }
  // Emit gauges
  for (const [key, value] of gauges.entries()) {
    lines.push(`${key} ${value}`);
  }
  return lines.join('\n') + '\n';
}

function incrementConnectorError(connector) {
  increment('wb_connector_errors_total', { connector });
}

module.exports = {
  increment,
  setGauge,
  observe,
  pgObserveLatencyMs,
  kmsIncrement,
  setBackupSuccess,
  getMetricsText,
  incrementConnectorError
};
