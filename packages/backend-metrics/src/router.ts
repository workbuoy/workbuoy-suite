import { ensureDefaultMetrics, getMetricsText, getOpenMetricsText, getRegistry } from './registry.js';
import type { ExpressLikeApp, MetricsRouterOptions, RouterLike } from './types.js';

export function createMetricsRouter(options?: MetricsRouterOptions): RouterLike;
export function createMetricsRouter(app: ExpressLikeApp, options?: MetricsRouterOptions): RouterLike;
export function createMetricsRouter(
  appOrOptions?: ExpressLikeApp | MetricsRouterOptions,
  maybeOptions?: MetricsRouterOptions
): RouterLike {
  const isAppLike = (value: unknown): value is ExpressLikeApp =>
    !!value && typeof value === 'object' && typeof (value as any).use === 'function';

  const app: ExpressLikeApp | undefined = isAppLike(appOrOptions) ? (appOrOptions as ExpressLikeApp) : undefined;
  const options: MetricsRouterOptions = (app ? maybeOptions : (appOrOptions as MetricsRouterOptions)) ?? {};

  const registry = getRegistry(options.registry);
  ensureDefaultMetrics({ register: registry });

  const path = options.path ?? '/metrics';
  const beforeCollect = options.beforeCollect;

  const handler = async (req: any, res: any = {}): Promise<string> => {
    await beforeCollect?.();

    const accept = String(req?.headers?.accept ?? '');
    const wantsOpenMetrics = accept.includes('application/openmetrics-text');
    const body = wantsOpenMetrics
      ? await getOpenMetricsText(registry)
      : await getMetricsText(registry);

    const contentType = wantsOpenMetrics
      ? 'application/openmetrics-text; version=1.0.0; charset=utf-8'
      : 'text/plain; version=0.0.4; charset=utf-8';

    if (typeof res.setHeader === 'function') {
      res.setHeader('Content-Type', contentType);
    }
    if ('statusCode' in res) {
      res.statusCode = 200;
    }
    if (typeof res.end === 'function') {
      res.end(body);
    }

    return body;
  };

  if (app) {
    app.get?.(path, handler);
    return app;
  }

  const router: RouterLike = {
    path,
    _routes: [{ method: 'GET', path, handler }],
    get(routePath: string, routeHandler: any) {
      const routes = (this as any)._routes as any[];
      routes.push({ method: 'GET', path: routePath, handler: routeHandler });
      return this;
    },
    handle: handler,
  } as RouterLike;

  return router;
}
