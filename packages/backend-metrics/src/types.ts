export type BeforeCollect = () => void | Promise<void>;

export interface MetricsRouterOptions {
  path?: string;
  registry?: unknown;
  beforeCollect?: BeforeCollect;
}

export interface ExpressLikeApp {
  use?: (...args: any[]) => any;
  get?: (...args: any[]) => any;
}
