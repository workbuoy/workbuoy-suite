import {
  collectDefaultMetrics,
  Counter,
  type CounterConfiguration,
  Histogram,
  type HistogramConfiguration,
  Registry,
} from "prom-client";

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

type CounterInit<T extends string> = CounterConfiguration<T> & {
  registry?: Registry;
};

type HistogramInit<T extends string> = HistogramConfiguration<T> & {
  registry?: Registry;
};

function resolveRegisters(
  registry: Registry | undefined,
  registers: Registry[] | undefined,
): Registry[] {
  if (Array.isArray(registers) && registers.length > 0) {
    return registers;
  }
  if (registry) {
    return [registry];
  }
  return [defaultRegistry];
}

export function createCounter<T extends string>(config: CounterInit<T>): Counter<T> {
  const { registry, registers, ...rest } = config;
  return new Counter<T>({ ...rest, registers: resolveRegisters(registry, registers) });
}

export function createHistogram<T extends string>(config: HistogramInit<T>): Histogram<T> {
  const { registry, registers, ...rest } = config;
  return new Histogram<T>({ ...rest, registers: resolveRegisters(registry, registers) });
}

function coerceRegistries(registries?: Registry[]): Registry[] {
  if (Array.isArray(registries) && registries.length > 0) {
    return registries;
  }
  return [defaultRegistry];
}

export function getMetricsText(registries?: Registry[]): Promise<string> {
  const merged = Registry.merge(coerceRegistries(registries));
  return merged.metrics();
}

export function getOpenMetricsText(registries?: Registry[]): Promise<string> {
  const merged = Registry.merge(coerceRegistries(registries));
  return merged.metrics({
    contentType: "application/openmetrics-text; version=1.0.0; charset=utf-8" as any,
  });
}
