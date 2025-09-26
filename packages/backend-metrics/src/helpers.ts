export {
  ensureDefaultMetrics,
  setupDefaultMetrics,
  getRegistry,
  getMetricsText,
  getOpenMetricsText,
  mergeRegistries,
  type CollectDefaultsOptions,
} from "./registry.js";

export { createCounter, createHistogram } from "./helpers/metrics.js";
