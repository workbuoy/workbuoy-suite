import express from 'express';
import { ensureDefaultNodeMetrics, getRegistry } from './registry.js';
import { isMetricsEnabled } from '../observability/metricsConfig.js';

export interface MetricsRouterOptions {
  beforeCollect?: () => Promise<void> | void;
}

export function createMetricsRouter(options: MetricsRouterOptions = {}) {
  const router = express.Router();

  router.get('/', async (_req, res) => {
    if (!isMetricsEnabled()) {
      return res.status(204).send();
    }

    if (options.beforeCollect) {
      await options.beforeCollect();
    }

    ensureDefaultNodeMetrics();

    const registry = getRegistry();
    res.set('Content-Type', registry.contentType);
    res.send(await registry.metrics());
  });

  return router;
}

export const metricsRouter = createMetricsRouter();
