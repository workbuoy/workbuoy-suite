import type { ProbeStatus } from '../../backend/meta/probes';

interface CounterLike {
  inc(value?: number): void;
  inc(labels: Record<string, string>, value?: number): void;
}

interface HistogramLike {
  observe(value: number): void;
  observe(labels: Record<string, string>, value: number): void;
}

interface RegistryLike {
  metrics(): Promise<string> | string;
}

let promClient: typeof import('prom-client') | undefined;

try {
  // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
  promClient = require('prom-client');
} catch (error) {
  promClient = undefined;
}

const register: RegistryLike | undefined = promClient?.register;

const ensureDefaultMetrics = (() => {
  let initialised = false;
  return () => {
    if (!promClient || initialised) {
      return;
    }
    if (typeof promClient.collectDefaultMetrics === 'function') {
      promClient.collectDefaultMetrics({ register: promClient.register });
    }
    initialised = true;
  };
})();

ensureDefaultMetrics();

const createNoopCounter = (): CounterLike => ({
  inc: () => undefined,
});

const createNoopHistogram = (): HistogramLike => ({
  observe: () => undefined,
});

type CounterConfiguration = import('prom-client').CounterConfiguration<string> & { labelNames?: readonly string[] };
type HistogramConfiguration = import('prom-client').HistogramConfiguration<string> & { labelNames?: readonly string[] };

const createCounter = (configuration: CounterConfiguration): CounterLike => {
  if (!promClient) {
    return createNoopCounter();
  }
  const counter = new promClient.Counter({
    ...configuration,
    registers: configuration.registers ?? (register ? [register as any] : undefined),
  });
  return counter;
};

const createHistogram = (configuration: HistogramConfiguration): HistogramLike => {
  if (!promClient) {
    return createNoopHistogram();
  }
  const histogram = new promClient.Histogram({
    ...configuration,
    registers: configuration.registers ?? (register ? [register as any] : undefined),
  });
  return histogram;
};

export const metaReadinessChecksTotal = createCounter({
  name: 'meta_readiness_checks_total',
  help: 'Count of meta readiness probe results grouped by status.',
  labelNames: ['check', 'status'],
});

export const policyDeniesTotal = createCounter({
  name: 'policy_denies_total',
  help: 'Total policy deny decisions recorded by META.',
  labelNames: ['feature', 'reason'],
});

export const metaRequestLatencyMs = createHistogram({
  name: 'meta_request_latency_ms',
  help: 'META endpoint request latency in milliseconds.',
  labelNames: ['route', 'method', 'status'],
  buckets: [5, 10, 25, 50, 75, 100, 250, 500, 750, 1000, 2500, 5000],
});

export const auditFailuresTotal = createCounter({
  name: 'audit_failures_total',
  help: 'Total audit failures aggregated by META.',
});

export function recordMetaReadinessCheck(check: string, status: ProbeStatus): void {
  metaReadinessChecksTotal.inc({ check, status });
}

export function recordPolicyDenyMetric(feature = 'meta_policy', reason = 'denied'): void {
  policyDeniesTotal.inc({ feature, reason });
}

export function recordMetaRequestLatency(route: string, method: string, statusCode: number, durationMs: number): void {
  const duration = Number.isFinite(durationMs) ? Math.max(0, durationMs) : 0;
  metaRequestLatencyMs.observe({ route, method, status: String(statusCode) }, duration);
}

export function recordAuditFailures(count: number): void {
  if (!Number.isFinite(count) || count <= 0) {
    return;
  }
  auditFailuresTotal.inc(count);
}

export async function collectMetricsText(): Promise<string> {
  if (!register) {
    return '# no-prom-client\n';
  }
  try {
    const metrics = await register.metrics();
    return typeof metrics === 'string' ? metrics : String(metrics);
  } catch (error) {
    return '# metrics-error\n';
  }
}
