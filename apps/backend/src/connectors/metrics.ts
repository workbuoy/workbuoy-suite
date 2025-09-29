import { Counter } from 'prom-client';
import { getRegistry } from '../metrics/registry.js';
import { getMetricsPrefix, isMetricsEnabled } from '../observability/metricsConfig.js';

function buildCounter(name: string, help: string, labelNames: readonly string[] = []) {
  const metricName = `${getMetricsPrefix()}${name}`;

  if (!isMetricsEnabled()) {
    return new Counter({ name: metricName, help, labelNames: [...labelNames], registers: [] });
  }

  const registry = getRegistry();
  const existing = safeGetCounter(registry, metricName);
  if (existing) {
    return existing;
  }

  return new Counter({ name: metricName, help, labelNames: [...labelNames], registers: [registry] });
}

function safeGetCounter(registry: ReturnType<typeof getRegistry>, metricName: string) {
  try {
    const metric = registry.getSingleMetric(metricName);
    return metric instanceof Counter ? metric : undefined;
  } catch {
    return undefined;
  }
}

export const wb_connector_ingest_total = buildCounter(
  'wb_connector_ingest_total',
  'Number of records ingested from provider webhooks/polling',
  ['provider', 'mode'] as const,
);

export const wb_connector_errors_total = buildCounter(
  'wb_connector_errors_total',
  'Number of connector errors',
  ['provider', 'mode'] as const,
);

export const wb_connector_retries_total = buildCounter(
  'wb_connector_retries_total',
  'Number of connector retries',
  ['provider'] as const,
);
