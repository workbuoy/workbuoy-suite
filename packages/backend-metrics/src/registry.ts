import {
  collectDefaultMetrics,
  Counter,
  type CounterConfiguration,
  Histogram,
  type HistogramConfiguration,
  Registry,
} from "prom-client";

// Keep typings tolerant across prom-client versions (v14 vs v15+ openmetrics).
type AnyRegistry = any;

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

  // Avoid depending on the exact prom-client signature shape across versions.
  collectDefaultMetrics({ register: registry, ...config });
  registriesWithDefaults.add(registry);
}

export function setupDefaultMetrics(opts?: CollectDefaultsOptions): ReturnType<typeof collectDefaultMetrics> {
  // Avoid depending on exact prom-client signature shapes across versions.
  return collectDefaultMetrics(opts as any);
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

function coerceRegistries(registries?: AnyRegistry[]): AnyRegistry[] {
  if (Array.isArray(registries) && registries.length > 0) {
    return registries;
  }
  return [defaultRegistry as AnyRegistry];
}

/**
 * Merges registries regardless of prom-client version. Avoids strict literal
 * content-type generics that cause TS2345 when passing mixed Registry types.
 */
export function mergeRegistries(registries?: AnyRegistry[]): AnyRegistry {
  const regs = coerceRegistries(registries);
  const merger = Registry as unknown as { merge?: (rs?: AnyRegistry[]) => AnyRegistry };

  if (typeof merger.merge === "function") {
    return merger.merge(regs);
  }

  // Extremely defensive: fall back to a fresh registry when merge() is absent.
  return new (Registry as any)();
}

export function getMetricsText(registries?: AnyRegistry[]): Promise<string> {
  const merged = mergeRegistries(registries);
  return merged.metrics();
}

export function getOpenMetricsText(registries?: AnyRegistry[]): Promise<string> {
  const merged = mergeRegistries(registries);
  // Some prom-client versions do not accept options for metrics(); rely on the default
  // content type to keep the helper broadly compatible.
  return merged.metrics();
}
