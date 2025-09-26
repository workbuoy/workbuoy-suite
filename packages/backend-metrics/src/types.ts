// Cross-version friendly options alias for prom-client collectDefaultMetrics
// Match the common shape but stay permissive across versions.
export type CollectDefaultsOptions = {
  register?: any;
  prefix?: string;
  labels?: Record<string, string>;
  gcDurationBuckets?: number[];
  eventLoopMonitoringPrecision?: number;
  timeout?: number;
} & Record<string, any>;

export type AnyRegistry = any;

export type { WithMetricsOptions, WithMetricsResult } from './middleware.js';
export type { MetricsRouterOptions } from './router.js';
