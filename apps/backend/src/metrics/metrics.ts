import { Counter, Histogram } from 'prom-client';
import { createCounter, createHistogram } from '@workbuoy/backend-metrics';
import { getRegistry, metricsEnabled } from './registry.js';

const registry = getRegistry();

function buildCounter(name: string, help: string, labelNames: string[] = []): Counter<string> {
  if (!metricsEnabled) {
    return new Counter({ name, help, labelNames, registers: [] });
  }
  return createCounter(registry, name, help, labelNames);
}

function buildHistogram(
  name: string,
  help: string,
  labelNames: string[] = [],
  buckets?: number[],
): Histogram<string> {
  if (!metricsEnabled) {
    return new Histogram({ name, help, labelNames, buckets, registers: [] });
  }
  return createHistogram(registry, name, help, labelNames, buckets);
}

export const crm_api_latency_ms = buildHistogram(
  'crm_api_latency_ms',
  'Latency for CRM API endpoints (ms)',
  ['method', 'route', 'status'],
  [10, 25, 50, 100, 200, 500, 1000, 2000],
);

export const audit_events_total = buildCounter('audit_events_total', 'Audit events');

export const crm_webhook_success_total = buildCounter(
  'crm_webhook_success_total',
  'Successful CRM webhook deliveries',
);

export const crm_webhook_error_total = buildCounter(
  'crm_webhook_error_total',
  'Failed CRM webhook deliveries',
);

export const wb_import_total = buildCounter(
  'wb_import_total',
  'Number of records imported via CRM bulk import',
  ['entity'],
);

export const wb_import_fail_total = buildCounter(
  'wb_import_fail_total',
  'Number of CRM import failures',
  ['entity'],
);

export const wb_export_total = buildCounter(
  'wb_export_total',
  'Number of CRM export operations executed',
  ['entity'],
);

export const crm_pipeline_transitions_total = buildCounter(
  'crm_pipeline_transitions_total',
  'Pipeline stage transitions recorded',
);

export const rbac_denied_total = buildCounter(
  'rbac_denied_total',
  'Denied RBAC checks',
  ['resource', 'action'],
);

export const rbac_policy_change_total = buildCounter(
  'rbac_policy_change_total',
  'Policy change operations executed via admin routes',
);

export const feature_usage_total = buildCounter(
  'feature_usage_total',
  'Recorded feature usage events',
  ['feature', 'action'],
);

export {
  wb_connector_ingest_total,
  wb_connector_errors_total,
  wb_connector_retries_total,
} from '../connectors/metrics.js';
