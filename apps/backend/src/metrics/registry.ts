import { collectDefaultMetrics, Registry } from 'prom-client';
import {
  wb_connector_errors_total,
  wb_connector_ingest_total,
  wb_connector_retries_total,
} from '../connectors/metrics.js';

const METRICS_ENABLED = String(process.env.METRICS_ENABLED ?? 'false').toLowerCase() === 'true';

const registry = new Registry();

if (METRICS_ENABLED) {
  collectDefaultMetrics({ register: registry });
  registry.registerMetric(wb_connector_ingest_total);
  registry.registerMetric(wb_connector_errors_total);
  registry.registerMetric(wb_connector_retries_total);
}

export const metricsEnabled = METRICS_ENABLED;

export function getRegistry(): Registry {
  return registry;
}
