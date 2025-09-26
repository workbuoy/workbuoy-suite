import type { RequestHandler } from 'express';
import { getRegistry, ensureDefaultMetrics } from './registry.js';

export function withMetrics(): RequestHandler {
  const reg = getRegistry();
  ensureDefaultMetrics({ register: reg as any });
  return (_req, _res, next) => next();
}
