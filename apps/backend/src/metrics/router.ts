import { Router } from 'express';
import { getRegistry } from './registry.js';

export interface MetricsRouterOptions {
  beforeCollect?: () => Promise<void> | void;
}

export function createMetricsRouter(options: MetricsRouterOptions = {}) {
  const registry = getRegistry();
  const router = Router();

  router.get('/', async (_req, res) => {
    if (options.beforeCollect) {
      await options.beforeCollect();
    }
    res.set('Content-Type', registry.contentType);
    res.end(await registry.metrics());
  });

  return router;
}

export const metricsRouter = createMetricsRouter();
