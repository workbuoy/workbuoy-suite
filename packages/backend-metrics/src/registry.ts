import { Registry, collectDefaultMetrics } from 'prom-client';
import type { CollectDefaultsOptions } from './types.js';

// Tverr-versjonsvennlig aliaser
export type AnyRegistry = any;

export function mergeRegistries(registries?: AnyRegistry[]): AnyRegistry {
  const regs = (registries ?? []) as AnyRegistry[];
  const R: any = Registry as any;
  if (typeof R.merge === 'function') return R.merge(regs);
  // Fallback: gi en ny registry for å unngå typesprik. Downstream kaller metrics() selv.
  return new (Registry as any)();
}

export function setupDefaultMetrics(opts?: CollectDefaultsOptions) {
  return collectDefaultMetrics(opts as any);
}

// Back-compat alias (tidligere importnavn i andre moduler)
export const ensureDefaultMetrics = setupDefaultMetrics;

export async function getMetricsText(registries?: AnyRegistry[]) {
  return (mergeRegistries(registries) as any).metrics();
}

export async function getOpenMetricsText(registries?: AnyRegistry[]) {
  return (mergeRegistries(registries) as any).metrics();
}

let _registry: AnyRegistry | undefined;
export function getRegistry() {
  if (_registry) return _registry;
  _registry = new (Registry as any)();
  return _registry;
}
