import { Registry, collectDefaultMetrics } from 'prom-client';
import type { CollectDefaultsOptions, AnyRegistry } from './types.js';

let _registry: AnyRegistry | undefined;

export function getRegistry(): AnyRegistry {
  if (_registry) return _registry;
  _registry = new (Registry as any)();
  return _registry;
}

export function setupDefaultMetrics(opts?: CollectDefaultsOptions) {
  return collectDefaultMetrics(opts as any);
}
// kompat-aliase som backend kan bruke
export const ensureDefaultMetrics = setupDefaultMetrics;

export function mergeRegistries(registries?: AnyRegistry[]): AnyRegistry {
  const regs = (registries ?? []) as AnyRegistry[];
  const R: any = Registry as any;
  if (typeof R.merge === 'function') return R.merge(regs);
  return new (Registry as any)(); // defensiv fallback
}

export async function getMetricsText(registries?: AnyRegistry[]) {
  return (mergeRegistries(registries) as any).metrics();
}

export async function getOpenMetricsText(registries?: AnyRegistry[]) {
  return (mergeRegistries(registries) as any).metrics();
}
