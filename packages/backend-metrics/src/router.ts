import { MetricsRouterOptions, ExpressLikeApp } from './types.js';
import { ensureDefaultMetrics, getMetricsText, getOpenMetricsText, getRegistry } from './registry.js';

type RouterLike = any;

export function createMetricsRouter(options?: MetricsRouterOptions): RouterLike;
export function createMetricsRouter(app: ExpressLikeApp, options?: MetricsRouterOptions): RouterLike;

export function createMetricsRouter(
  appOrOptions?: ExpressLikeApp | MetricsRouterOptions,
  maybeOptions?: MetricsRouterOptions
): RouterLike {
  const isAppLike = (v: any) =>
    v && typeof v === 'object' && (typeof v.use === 'function' || typeof v.get === 'function');

  const app: ExpressLikeApp | undefined = isAppLike(appOrOptions) ? (appOrOptions as ExpressLikeApp) : undefined;
  const options: MetricsRouterOptions = (app ? maybeOptions : (appOrOptions as MetricsRouterOptions)) ?? {};

  const { path = '/metrics', registry = getRegistry(), beforeCollect } = options;

  ensureDefaultMetrics(registry);

  const handler = async (req: any, res: any) => {
    await beforeCollect?.();
    const accept = String(req?.headers?.accept || '');
    const wantsOpen = accept.includes('application/openmetrics-text');

    const body = wantsOpen ? await getOpenMetricsText(registry) : await getMetricsText(registry);
    res.setHeader(
      'Content-Type',
      wantsOpen
        ? 'application/openmetrics-text; version=1.0.0; charset=utf-8'
        : 'text/plain; version=0.0.4; charset=utf-8'
    );
    res.statusCode = 200;
    res.end(body);
  };

  if (app) {
    app.get?.(path, handler);
    return app as unknown as RouterLike;
  }

  const router: RouterLike = {
    _routes: [{ method: 'GET', path, handler }],
    get(p: string, h: any) { this._routes.push({ method: 'GET', path: p, handler: h }); },
    handle: handler,
  };
  return router;
}
