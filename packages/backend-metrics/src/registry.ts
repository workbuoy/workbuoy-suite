import { collectDefaultMetrics, Registry, register as globalRegister } from 'prom-client';
import type { AnyRegistry, CollectDefaultsOptions } from './types.js';

// Tolerant "any" for registry shape across prom-client versions.
type PRegistry = Registry & { contentType?: string };

let _singleton: PRegistry | undefined;

export function getRegistry(reg?: AnyRegistry): PRegistry {
  if (reg && typeof reg === 'object') return reg as PRegistry;
  if (!_singleton) _singleton = (globalRegister as unknown as PRegistry) ?? new (Registry as any)();
  return _singleton;
}

export function setupDefaultMetrics(opts?: CollectDefaultsOptions): void {
  const reg = getRegistry(opts?.register);
  collectDefaultMetrics({ ...(opts as any), register: reg } as any);
}

// Back-compat name used in earlier attempts and in backend wiring.
export const ensureDefaultMetrics = setupDefaultMetrics;

export function mergeRegistries(registries?: AnyRegistry[]): PRegistry {
  const regs = (registries?.length ? registries : [getRegistry()]) as PRegistry[];
  // prom-client v15 has Registry.merge; older/newer may differ — fall back to concat.
  const maybeMerge = (Registry as any).merge ?? (globalRegister as any)?.merge;
  if (typeof maybeMerge === 'function') return maybeMerge(regs);
  // Fallback: make a throwaway registry that concatenates on collect
  const target = new (Registry as any)() as PRegistry;
  (target as any).metrics = async () => (await Promise.all(regs.map((r) => (r as any).metrics?.() ?? ''))).join('');
  (target as any).getSingleMetricAsString = async (name: string) =>
    (await Promise.all(regs.map((r) => (r as any).getSingleMetricAsString?.(name) ?? ''))).join('');
  return target;
}

export async function getMetricsText(reg?: AnyRegistry): Promise<string> {
  const r = (reg ? mergeRegistries([reg]) : getRegistry()) as any;
  return typeof r.metrics === 'function' ? r.metrics() : '';
}

export async function getOpenMetricsText(reg?: AnyRegistry): Promise<string> {
  // Same as above; prom-client switches content-type by negotiation; we only expose text here.
  return getMetricsText(reg);
}
