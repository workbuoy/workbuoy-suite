import type { Request, Response } from 'express';
import { Router } from 'express';
import { createInMemoryTelemetryStore } from './stores/inMemory.js';
import type { FeatureUsageEvent, TelemetryStore } from './types.js';

export interface TelemetryRouterOptions {
  usePersistence?: boolean;
  fallbackStore?: TelemetryStore;
  getPersistentStore?: () => TelemetryStore | Promise<TelemetryStore>;
  defaultTenantId?: string;
  resolveTenantId?: (req: Request, fallbackTenantId: string) => string;
  now?: () => Date;
}

interface StoreCache {
  persistent: TelemetryStore | null;
}

function resolveTenantIdFromRequest(req: Request, fallbackTenantId: string): string {
  const tenantHeader = req.header('x-tenant');
  if (tenantHeader) {
    return String(tenantHeader);
  }
  const bodyTenant = (req.body as { tenantId?: string } | undefined)?.tenantId;
  if (bodyTenant) {
    return String(bodyTenant);
  }
  const queryTenant = (req.query as { tenantId?: string } | undefined)?.tenantId;
  if (queryTenant) {
    return String(queryTenant);
  }
  return fallbackTenantId;
}

function ensureStore(cache: StoreCache, options: TelemetryRouterOptions, fallback: TelemetryStore) {
  return async () => {
    if (!options.usePersistence || !options.getPersistentStore) {
      return fallback;
    }

    if (!cache.persistent) {
      cache.persistent = await Promise.resolve(options.getPersistentStore());
    }

    return cache.persistent ?? fallback;
  };
}

function buildUsageEvent(
  req: Request,
  tenantId: string,
  now: () => Date,
): FeatureUsageEvent | null {
  const { userId, featureId, action, metadata } = (req.body ?? {}) as Partial<FeatureUsageEvent>;
  if (typeof userId !== 'string' || typeof featureId !== 'string' || typeof action !== 'string') {
    return null;
  }
  return {
    userId,
    tenantId,
    featureId,
    action: action as FeatureUsageEvent['action'],
    ts: now(),
    metadata: metadata && typeof metadata === 'object' ? metadata : undefined,
  };
}

export function createTelemetryRouter(options: TelemetryRouterOptions = {}) {
  const router = Router();
  const fallbackStore = options.fallbackStore ?? createInMemoryTelemetryStore();
  const cache: StoreCache = { persistent: null };
  const getStore = ensureStore(cache, options, fallbackStore);
  const fallbackTenantId = options.defaultTenantId ?? 'DEV';
  const resolveTenant = options.resolveTenantId ?? resolveTenantIdFromRequest;
  const now = options.now ?? (() => new Date());

  router.post('/usage/feature', async (req: Request, res: Response) => {
    try {
      const tenantId = resolveTenant(req, fallbackTenantId);
      const event = buildUsageEvent(req, tenantId, now);

      if (!event) {
        res.status(400).json({ error: 'Missing userId/featureId/action' });
        return;
      }

      const store = await getStore();
      await store.recordFeatureUsage(event);
      res.json({ ok: true });
    } catch (error) {
      res.status(500).json({
        error: 'usage_record_failed',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  router.get('/usage/aggregate/:userId', async (req: Request, res: Response) => {
    try {
      const tenantId = resolveTenant(req, fallbackTenantId);
      const userId = String(req.params.userId ?? '');
      if (!userId) {
        res.status(400).json({ error: 'Missing userId' });
        return;
      }
      const store = await getStore();
      const usage = await store.aggregateFeatureUseCount(userId, tenantId);
      res.json(usage);
    } catch (error) {
      res.status(500).json({
        error: 'usage_aggregate_failed',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  return router;
}
