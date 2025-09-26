// NodeNext barrel – keep .js extensions on relative exports.
import { createMetricsRouter as createMetricsRouterImpl } from './router.js';
import type { CreateMetricsRouter } from './types.js';

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

export const createMetricsRouter: CreateMetricsRouter =
  createMetricsRouterImpl as unknown as CreateMetricsRouter;

export type {
  AnyRegistry,
  CollectDefaultsOptions,
  BeforeCollect,
  MetricsRouterOptions,
  ExpressLikeApp,
  CreateMetricsRouter,
} from './types.js';
