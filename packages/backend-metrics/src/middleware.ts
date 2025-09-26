import { ensureDefaultMetrics, getRegistry } from './registry.js';
import type { AnyRegistry } from './types.js';

// Express-like middleware, typed loosely to avoid a hard express dep at build time.
export function withMetrics(reg?: AnyRegistry) {
  const registry = getRegistry(reg);
  ensureDefaultMetrics({ register: registry });
  return function (_req: any, _res: any, next: any) {
    // no-op wrapper, real logic can live where express exists
    return typeof next === 'function' ? next() : undefined;
  };
}
