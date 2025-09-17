import client from 'prom-client';
import type { ProbeStatus } from '../../backend/meta/probes';

export const metaReadinessChecksTotal = new client.Counter({
  name: 'meta_readiness_checks_total',
  help: 'Count of meta readiness probe results grouped by status.',
  labelNames: ['check', 'status'] as const,
});

export function recordMetaReadinessCheck(check: string, status: ProbeStatus): void {
  metaReadinessChecksTotal.inc({ check, status });
}

export const policyDeniesTotal = new client.Counter({
  name: 'policy_denies_total',
  help: 'Total policy deny decisions recorded by META.',
});

export function recordPolicyDenyMetric(): void {
  policyDeniesTotal.inc();
}
