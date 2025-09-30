import { Router } from 'express';
import { ensureDefaultNodeMetrics, getRegistry } from './registry.js';
import { isMetricsEnabled } from '../observability/metricsConfig.js';

export interface MetricsRouterOptions {
  beforeCollect?: () => Promise<void> | void;
}

export function createMetricsRouter(options: MetricsRouterOptions = {}) {
  const router = Router();

  router.get('/', async (_req, res) => {
    res.setHeader('content-type', 'text/plain; version=0.0.4; charset=utf-8');

    if (!isMetricsEnabled()) {
      return res.status(200).send('');
    }

    if (options.beforeCollect) {
      await options.beforeCollect();
    }

    ensureDefaultNodeMetrics();

    const registry = getRegistry();
    const snapshot = await registry.metrics();
    const payload = snapshot.trim().length > 0 ? snapshot : '';

    res.status(200).send(payload);
  });

  return router;
}

export const metricsRouter = createMetricsRouter();
