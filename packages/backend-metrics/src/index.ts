import type { MetricsRouterOptions, ExpressLikeApp, BeforeCollect } from './types.js';
import { createMetricsRouter as _implCreateMetricsRouter } from './router.js';

// Public API with explicit overloads so dist/index.d.ts contains both signatures
export function createMetricsRouter(options?: MetricsRouterOptions): any;
export function createMetricsRouter(app: ExpressLikeApp, options?: MetricsRouterOptions): any;
export function createMetricsRouter(...args: any[]): any {
  return (_implCreateMetricsRouter as any)(...args);
}

// Re-export types and helpers
export type { MetricsRouterOptions, ExpressLikeApp, BeforeCollect } from './types.js';
export { ensureDefaultMetrics, getRegistry, getMetricsText, getOpenMetricsText } from './registry.js';
export { withMetrics } from './middleware.js';
export { createCounter } from './counter.js';
