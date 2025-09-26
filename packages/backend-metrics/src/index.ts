// NodeNext barrel – bruk .js-endelser for alle relative re-eksporter.
// Re-eksporter NØYAKTIG de navnene som backend importerer.
export { getRegistry, setupDefaultMetrics, ensureDefaultMetrics, mergeRegistries, getMetricsText, getOpenMetricsText } from './registry.js';
export { withMetrics } from './middleware.js';
export { createMetricsRouter } from './router.js';
export { createCounter, createHistogram } from './helpers.js';

// Typer må re-eksporteres som type under isolatedModules
export type { AnyRegistry, CollectDefaultsOptions } from './types.js';
