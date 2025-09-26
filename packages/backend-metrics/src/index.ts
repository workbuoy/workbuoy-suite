// NodeNext barrel – keep .js extensions on relative exports.
import { createMetricsRouter as createMetricsRouterImpl } from './router.js';
import type { ExpressLikeApp, MetricsRouterOptions } from './types.js';

export function createMetricsRouter(options?: MetricsRouterOptions): any;
export function createMetricsRouter(app: ExpressLikeApp, options?: MetricsRouterOptions): any;
export function createMetricsRouter(...args: any[]): any {
  return (createMetricsRouterImpl as (...inner: any[]) => any)(...args);
}

export { createCounter, createHistogram } from './helpers.js';
export { withMetrics } from './middleware.js';
export {
  getRegistry,
  setupDefaultMetrics,
  ensureDefaultMetrics,
  mergeRegistries,
  getMetricsText,
  getOpenMetricsText,
} from './registry.js';

export type {
  AnyRegistry,
  CollectDefaultsOptions,
  BeforeCollect,
  MetricsRouterOptions,
  ExpressLikeApp,
} from './types.js';
