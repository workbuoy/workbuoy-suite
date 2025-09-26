// Permissive cross-version types. Keep very tolerant to prom-client changes.
export type AnyRegistry = unknown;

export type BeforeCollect = () => void | Promise<void>;

export interface CollectDefaultsOptions {
  register?: AnyRegistry;
  prefix?: string;
  labels?: Record<string, string>;
  gcDurationBuckets?: number[];
  interval?: number;
  // allow future/unknown keys without breaking
  [k: string]: unknown;
}

export interface MetricsRouterOptions {
  path?: string;
  registry?: unknown;
  beforeCollect?: BeforeCollect;
}

export interface ExpressLikeApp {
  use?: (...args: any[]) => any;
  get?: (...args: any[]) => any;
}

export type CreateMetricsRouter = {
  (options?: MetricsRouterOptions): any;
  (app: ExpressLikeApp, options?: MetricsRouterOptions): any;
};
