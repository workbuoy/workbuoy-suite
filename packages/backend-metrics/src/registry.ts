import { collectDefaultMetrics, Registry } from "prom-client";

const defaultRegistry = new Registry();
const registriesWithDefaults = new WeakSet<Registry>();

export type CollectDefaultsOptions = Parameters<typeof collectDefaultMetrics>[0];

export function getRegistry(): Registry {
  return defaultRegistry;
}

export function ensureDefaultMetrics(
  registry: Registry = defaultRegistry,
  config?: CollectDefaultsOptions,
): void {
  if (registriesWithDefaults.has(registry)) {
    return;
  }

  collectDefaultMetrics({ register: registry, ...config });
  registriesWithDefaults.add(registry);
}
