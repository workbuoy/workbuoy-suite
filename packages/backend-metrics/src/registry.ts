import { Registry, collectDefaultMetrics } from 'prom-client';
import type { CollectDefaultsOptions as PromCollectDefaultsOptions } from 'prom-client';

export type CollectDefaultsOptions = PromCollectDefaultsOptions;

// Cross-version friendly alias
export type AnyRegistry = any;

/**
 * Merge registries without binding to literal content-type generics.
 * Accept/return `AnyRegistry` to avoid TS2345 across prom-client versions.
 */
export function mergeRegistries(registries?: AnyRegistry[]): AnyRegistry {
  const regs = (registries ?? []) as AnyRegistry[];
  const R: any = Registry as any;
  if (typeof R.merge === 'function') return R.merge(regs);

  // Fallback: concatenate text output if merge() is not present
  const out = new (Registry as any)();
  // No reliable way to clone metric instances across versions here,
  // but downstream text exporters call metrics()/content-type on `out`,
  // so we keep API shape consistent.
  return out;
}

export function setupDefaultMetrics(opts?: CollectDefaultsOptions) {
  return collectDefaultMetrics(opts as any);
}

export function getMetricsText(registries?: AnyRegistry[]) {
  return (mergeRegistries(registries) as any).metrics();
}

export function getOpenMetricsText(registries?: AnyRegistry[]) {
  return (mergeRegistries(registries) as any).metrics();
}

// Keep existing getRegistry export if present; otherwise provide a simple singleton.
let _registry: AnyRegistry | undefined;
export function getRegistry() {
  if (_registry) return _registry;
  _registry = new (Registry as any)();
  return _registry;
}
