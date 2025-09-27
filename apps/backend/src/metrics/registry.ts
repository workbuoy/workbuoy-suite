import { collectDefaultMetrics, Registry } from 'prom-client';
import { getDefaultLabels, getMetricsPrefix, isMetricsEnabled } from '../observability/metricsConfig.js';

let registry: Registry | null = null;
let defaultMetricsRegistered = false;

export function getRegistry(): Registry {
  if (!registry) {
    registry = new Registry();
    const labels = getDefaultLabels();
    if (labels && Object.keys(labels).length > 0) {
      registry.setDefaultLabels(labels);
    }
  }

  return registry;
}

export function resetRegistryForTests(): void {
  registry = null;
  defaultMetricsRegistered = false;
}

export function ensureDefaultNodeMetrics(): void {
  if (!isMetricsEnabled() || defaultMetricsRegistered) {
    return;
  }

  collectDefaultMetrics({ register: getRegistry(), prefix: getMetricsPrefix() });
  defaultMetricsRegistered = true;
}
