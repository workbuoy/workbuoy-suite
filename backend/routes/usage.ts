import { Router } from 'express';
import {
  recordFeatureUsage as recordInMemory,
  aggregateFeatureUseCount as aggregateInMemory,
} from '../../src/telemetry/usageSignals';
import { envBool } from '../../src/core/env';

const r = Router();
const usePersistence = envBool('FF_PERSISTENCE', false);

type UsageDbModule = typeof import('../../src/telemetry/usageSignals.db');
let dbModule: UsageDbModule | null = null;

function ensureDbModule(): UsageDbModule {
  if (!dbModule) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    dbModule = require('../../src/telemetry/usageSignals.db') as UsageDbModule;
  }
  return dbModule;
}

// NB: Router mountes under /api i server.ts, så path her skal ikke ha /api-prefiks.
r.post('/usage/feature', async (req, res) => {
  try {
    const tenantId = String(req.header('x-tenant') ?? req.body?.tenantId ?? 'DEV');
    const { userId, featureId, action } = req.body || {};
    if (!userId || !featureId || !action) {
      return res.status(400).json({ error: 'Missing userId/featureId/action' });
    }

    if (usePersistence) {
      const { recordFeatureUsage: recordDbUsage } = ensureDbModule();
      await recordDbUsage({ userId, tenantId, featureId, action });
    } else {
      recordInMemory({
        userId,
        tenantId,
        featureId,
        action,
        ts: new Date().toISOString(),
      });
    }

    res.json({ ok: true });
  } catch (err: any) {
    res
      .status(500)
      .json({ error: 'usage_record_failed', message: err?.message || String(err) });
  }
});

r.get('/usage/aggregate/:userId', async (req, res) => {
  try {
    const tenantId = String(req.header('x-tenant') ?? req.query?.tenantId ?? 'DEV');
    const userId = String(req.params.userId);

    const usage = usePersistence
      ? await ensureDbModule().aggregateFeatureUseCount(userId, tenantId)
      : aggregateInMemory(userId, tenantId);

    res.json(usage);
  } catch (err: any) {
    res
      .status(500)
      .json({ error: 'usage_aggregate_failed', message: err?.message || String(err) });
  }
});

export default r;
