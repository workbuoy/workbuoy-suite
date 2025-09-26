export type AnyRegistry = any;
export type CollectDefaultsOptions = {
  register?: any;
  prefix?: string;
  labels?: Record<string, string>;
  gcDurationBuckets?: number[];
  eventLoopMonitoringPrecision?: number;
  timeout?: number;
} & Record<string, any>;
