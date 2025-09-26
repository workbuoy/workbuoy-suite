import { Router, type Request, type Response } from 'express';
import type { Registry } from 'prom-client';
import { getRegistry, getMetricsText, getOpenMetricsText } from './registry.js';

export interface MetricsRouterOptions {
  registry?: Registry;
  beforeCollect?: () => Promise<void> | void;
  path?: string;
}

async function collectMetrics(
  registries: Registry[],
  res: Response,
  beforeCollect?: () => Promise<void> | void,
  acceptHeader?: string,
): Promise<void> {
  if (beforeCollect) {
    await beforeCollect();
  }

  const accept = acceptHeader ?? '';
  const wantsOpenMetrics = accept.toLowerCase().includes('openmetrics');
  const body = wantsOpenMetrics
    ? await getOpenMetricsText(registries)
    : await getMetricsText(registries);

  res.setHeader(
    'content-type',
    wantsOpenMetrics
      ? 'application/openmetrics-text; version=1.0.0; charset=utf-8'
      : 'text/plain; version=0.0.4; charset=utf-8',
  );
  res.send(body);
}

export function createMetricsRouter(options: MetricsRouterOptions = {}): Router {
  const registry = options.registry ?? (getRegistry() as Registry);
  const router = Router();
  const routePath = options.path ?? '/';

  router.get(routePath, async (req: Request, res: Response) => {
    try {
      await collectMetrics([registry], res, options.beforeCollect, req.headers['accept'] as string | undefined);
    } catch (error) {
      res.status(500).json({
        error: 'metrics_unavailable',
        message: error instanceof Error ? error.message : 'Unexpected error while collecting metrics',
      });
    }
  });

  return router;
}

export const metricsRouter = createMetricsRouter();
