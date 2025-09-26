export { getRegistry, ensureDefaultMetrics, type CollectDefaultsOptions } from "./registry.js";
export {
  withMetrics,
  createRequestMetricsMiddleware,
  type WithMetricsOptions,
  type WithMetricsResult,
} from "./middleware.js";
export { metricsRouter, createMetricsRouter, type MetricsRouterOptions } from "./router.js";
