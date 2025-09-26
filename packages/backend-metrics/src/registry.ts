import { Registry, collectDefaultMetrics } from 'prom-client';
import type { CollectDefaultsOptions } from './types.js';

// Avoid literal content-type generics across prom-client versions
export type AnyRegistry = any;

export function mergeRegistries(registries?: AnyRegistry[]): AnyRegistry {
  const regs = (registries ?? []) as AnyRegistry[];
  const R: any = Registry as any;
  if (typeof R.merge === 'function') return R.merge(regs);

  // Fallback: provide a fresh registry (downstream text exporters will call metrics() on it);
  // older prom-client versions can lack merge(). We keep the API shape stable.
  return new (Registry as any)();
}

export function setupDefaultMetrics(opts?: CollectDefaultsOptions) {
  return collectDefaultMetrics(opts as any);
}

// Back-compat alias for previous imports
export const ensureDefaultMetrics = setupDefaultMetrics;

// Text helpers
export function getMetricsText(registries?: AnyRegistry[]) {
  return (mergeRegistries(registries) as any).metrics();
}

export function getOpenMetricsText(registries?: AnyRegistry[]) {
  return (mergeRegistries(registries) as any).metrics();
}

// Lazy singleton accessor (used by router/middleware)
let _registry: AnyRegistry | undefined;
export function getRegistry() {
  if (_registry) return _registry;
  _registry = new (Registry as any)();
  return _registry;
}

export type { CollectDefaultsOptions } from './types.js';
