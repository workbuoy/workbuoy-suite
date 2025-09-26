// NodeNext barrel: bruk .js-endelser og skill eksplisitt mellom runtime og typer.
export { mergeRegistries, setupDefaultMetrics, ensureDefaultMetrics, getMetricsText, getOpenMetricsText, getRegistry } from './registry.js';
export { withMetrics } from './middleware.js';
export { createMetricsRouter } from './router.js';
export { createCounter, createHistogram } from './helpers.js';

// typer må re-eksporteres med `export type` under isolatedModules
export type { CollectDefaultsOptions, AnyRegistry } from './types.js';
