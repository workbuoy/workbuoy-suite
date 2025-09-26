export type AnyRegistry = any;

// Tolerant versjon av prom-client collectDefaultMetrics options
export type CollectDefaultsOptions = {
  register?: any;
  prefix?: string;
  labels?: Record<string, string>;
  gcDurationBuckets?: number[];
  eventLoopMonitoringPrecision?: number;
  timeout?: number;
} & Record<string, any>;
