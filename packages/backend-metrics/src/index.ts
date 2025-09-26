// NodeNext barrel – keep .js extensions on relative exports.
export { createCounter, createHistogram } from './helpers.js';
export { createMetricsRouter } from './router.js';
export { withMetrics } from './middleware.js';
export {
  getRegistry,
  setupDefaultMetrics,
  ensureDefaultMetrics,
  mergeRegistries,
  getMetricsText,
  getOpenMetricsText,
} from './registry.js';

export type { AnyRegistry, CollectDefaultsOptions, BeforeCollect, MetricsRouterOptions } from './types.js';
