// NodeNext barrel – IMPORTANT: use .js extensions
export { createCounter, createHistogram } from './helpers.js';
export { createMetricsRouter } from './router.js';
export { withMetrics } from './middleware.js';
export {
  getRegistry,
  setupDefaultMetrics,
  ensureDefaultMetrics,
  mergeRegistries,
  getMetricsText,
  getOpenMetricsText
} from './registry.js';

// Re-export types consumed by the backend
export type { AnyRegistry, CollectDefaultsOptions } from './types.js';
