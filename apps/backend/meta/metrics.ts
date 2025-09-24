import client from 'prom-client';

type StatusCode = number | string;

type RequestLabels = {
  route: string;
  method: string;
  status: string;
};

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const auditFailuresTotal = new client.Counter({
  name: 'meta_audit_failures_total',
  help: 'Number of audit failures observed',
  registers: [register],
});

const policyDeniedTotal = new client.Counter({
  name: 'meta_policy_denied_total',
  help: 'Number of policy denials returned from the meta surface',
  registers: [register],
});

const readinessChecks = new client.Counter({
  name: 'meta_readiness_checks_total',
  help: 'Meta readiness check invocations by status',
  labelNames: ['probe', 'status'] as const,
  registers: [register],
});

const requestLatency = new client.Histogram({
  name: 'meta_request_duration_ms',
  help: 'Meta route latency in milliseconds',
  labelNames: ['route', 'method', 'status'] as const,
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2000],
  registers: [register],
});

function normaliseLabels(route: string, method: string, status: StatusCode): RequestLabels {
  return {
    route: route || 'unknown',
    method: method ? method.toUpperCase() : 'GET',
    status: String(status || 200),
  };
}

export function recordAuditFailures(count: number): void {
  if (Number.isFinite(count) && count > 0) {
    auditFailuresTotal.inc(count);
  }
}

export function recordPolicyDenyMetric(_feature?: string, _reason?: string): void {
  policyDeniedTotal.inc();
}

export function recordMetaReadinessCheck(probe: string, status: string): void {
  readinessChecks.labels(probe || 'unknown', status || 'unknown').inc();
}

export function recordMetaRequestLatency(route: string, method: string, status: StatusCode, durationMs: number): void {
  const labels = normaliseLabels(route, method, status);
  requestLatency.observe(labels, Math.max(0, durationMs));
}

export async function collectMetricsText(): Promise<string> {
  return register.metrics();
}

export { register as metaMetricsRegistry };
