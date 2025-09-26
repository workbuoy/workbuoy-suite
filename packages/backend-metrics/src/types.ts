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

export interface ExpressLikeApp {
  use?: (...args: any[]) => unknown;
  get?: (...args: any[]) => unknown;
  [key: string]: unknown;
}

export interface RouterLike {
  get?: (path: string, handler: any) => unknown;
  handle?: (...args: any[]) => unknown;
  [key: string]: unknown;
}

export interface MetricsRouterOptions {
  path?: string;
  registry?: AnyRegistry;
  beforeCollect?: BeforeCollect;
}

export type CreateMetricsRouter = {
  (options?: MetricsRouterOptions): RouterLike;
  (app: ExpressLikeApp, options?: MetricsRouterOptions): RouterLike;
};
