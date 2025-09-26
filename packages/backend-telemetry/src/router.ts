import type { Request, Response } from 'express';
import { Router } from 'express';
import { createInMemoryTelemetryStorage } from './stores/inMemory.js';
import type { TelemetryEvent, TelemetryStorage } from './types.js';

export interface TelemetryRouterOptions {
  usePersistence?: boolean;
  fallbackStore?: TelemetryStorage;
  getPersistentStore?: () => TelemetryStorage | Promise<TelemetryStorage>;
  defaultTenantId?: string;
  resolveTenantId?: (req: Request, fallbackTenantId: string) => string;
  now?: () => Date;
}

interface StoreCache {
  persistent: TelemetryStorage | null;
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

function ensureStore(cache: StoreCache, options: TelemetryRouterOptions, fallback: TelemetryStorage) {
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
): TelemetryEvent | null {
  const { userId, featureId, action, metadata } = (req.body ?? {}) as Partial<TelemetryEvent>;
  if (typeof userId !== 'string' || typeof featureId !== 'string' || typeof action !== 'string') {
    return null;
  }
  return {
    userId,
    tenantId,
    featureId,
    action,
    ts: now(),
    metadata: metadata && typeof metadata === 'object' ? metadata : undefined,
  };
}

function aggregateIfSupported(
  store: TelemetryStorage,
  userId: string,
  tenantId: string,
): Promise<Record<string, number>> | Record<string, number> {
  const aggregator = (store as any).aggregateFeatureUseCount;
  if (typeof aggregator === 'function') {
    return aggregator.call(store, userId, tenantId);
  }
  return {};
}

export function createTelemetryRouter(options: TelemetryRouterOptions = {}) {
  const router = Router();
  const fallbackStore = options.fallbackStore ?? createInMemoryTelemetryStorage();
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
      await store.record(event);
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
      const usage = await aggregateIfSupported(store, userId, tenantId);
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
