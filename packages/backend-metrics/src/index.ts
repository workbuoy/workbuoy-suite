// Central barrel for NodeNext consumers. Re-export all public API.
export * from './types';
export {
  AnyRegistry,
  mergeRegistries,
  setupDefaultMetrics,
  getMetricsText,
  getOpenMetricsText,
  getRegistry,
} from './registry';
export { withMetrics } from './middleware';
export { createMetricsRouter } from './router';
export { createCounter, createHistogram } from './helpers/metrics';
