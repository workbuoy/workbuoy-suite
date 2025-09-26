// Barrel for NodeNext consumers – export runtime + types explicitly.
export {
  mergeRegistries,
  setupDefaultMetrics,
  ensureDefaultMetrics,
  getMetricsText,
  getOpenMetricsText,
  getRegistry,
} from './registry.js';
export { withMetrics } from './middleware.js';
export { createMetricsRouter } from './router.js';
export { createCounter, createHistogram } from './helpers.js';

// types
export type { CollectDefaultsOptions, AnyRegistry } from './types.js';
