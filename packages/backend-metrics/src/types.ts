// Permissive cross-version types. Keep very tolerant to prom-client changes.
export type AnyRegistry = unknown;

export interface CollectDefaultsOptions {
  register?: AnyRegistry;
  prefix?: string;
  labels?: Record<string, string>;
  gcDurationBuckets?: number[];
  interval?: number;
  // allow future/unknown keys without breaking
  [k: string]: unknown;
}
