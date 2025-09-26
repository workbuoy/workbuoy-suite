import { getRegistry, ensureDefaultMetrics } from './registry.js';

type AnyRegistry = unknown;

type NextFn = (...args: any[]) => any;

type Handler = (req: any, res: any, next: NextFn) => unknown;

export function withMetrics(reg?: AnyRegistry): Handler {
  const registry = getRegistry(reg);
  ensureDefaultMetrics(registry);
  return (_req, _res, next) => next();
}
