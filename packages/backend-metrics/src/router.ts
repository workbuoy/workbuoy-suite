import { ensureDefaultMetrics, getMetricsText, getOpenMetricsText, getRegistry } from './registry.js';
import type { AnyRegistry } from './types.js';

export function createMetricsRouter(opts?: { path?: string; registry?: AnyRegistry }) {
  const reg = getRegistry(opts?.registry);
  ensureDefaultMetrics({ register: reg });

  // Return a tiny "router-like" object that backend can mount (it only needs the symbol to exist at build time).
  const router: any = {};
  router.path = opts?.path ?? '/metrics';
  router.handle = async (req: any, res: any) => {
    const accept = (req?.headers?.accept as string) ?? '';
    const open = accept.includes('application/openmetrics-text');
    const body = open ? await getOpenMetricsText(reg) : await getMetricsText(reg);
    const ctype = open
      ? 'application/openmetrics-text; version=1.0.0; charset=utf-8'
      : 'text/plain; version=0.0.4; charset=utf-8';
    if (res?.setHeader) res.setHeader('Content-Type', ctype);
    if (res?.end) res.end(body);
    return body;
  };
  return router;
}
