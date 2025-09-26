import { collectDefaultMetrics, Registry, type DefaultMetricsCollectorConfiguration } from "prom-client";

const defaultRegistry = new Registry();
const registriesWithDefaults = new WeakSet<Registry>();

export function getRegistry(): Registry {
  return defaultRegistry;
}

export function ensureDefaultMetrics(
  registry: Registry = defaultRegistry,
  config?: DefaultMetricsCollectorConfiguration,
): void {
  if (registriesWithDefaults.has(registry)) {
    return;
  }

  collectDefaultMetrics({ register: registry, ...config });
  registriesWithDefaults.add(registry);
}
