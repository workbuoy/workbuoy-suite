import { collectDefaultMetrics, Registry } from "prom-client";

// Keep typings tolerant across prom-client versions (v14 vs v15+ openmetrics).
export type AnyRegistry = any;

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

  // Fallback: emulate a merged registry by delegating to the individual registries.
  const safeRegs = regs.filter(Boolean);

  return {
    async metrics() {
      const parts = await Promise.all(
        safeRegs.map((registry) => {
          try {
            return typeof registry.metrics === "function" ? registry.metrics() : "";
          } catch {
            return "";
          }
        }),
      );

      return parts.filter((part): part is string => Boolean(part)).join("\n");
    },
    getMetricsAsJSON() {
      return safeRegs.flatMap((registry) => {
        try {
          return typeof registry.getMetricsAsJSON === "function" ? registry.getMetricsAsJSON() : [];
        } catch {
          return [];
        }
      });
    },
  } as AnyRegistry;
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
