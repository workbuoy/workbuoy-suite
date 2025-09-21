import { Router } from 'express';
import {
  recordFeatureUsage as recordInMemory,
  aggregateFeatureUseCount as aggregateInMemory,
} from '../../src/telemetry/usageSignals';
import {
  recordFeatureUsage as recordDbUsage,
  aggregateFeatureUseCount as aggregateFromDb,
} from '../../src/telemetry/usageSignals.db';
import { envBool } from '../../src/core/env';

const r = Router();
const usePersistence = envBool('FF_PERSISTENCE', false);

// NB: Router mountes under /api i server.ts, så path her skal ikke ha /api-prefiks.
r.post('/usage/feature', async (req, res) => {
  try {
    const tenantId = String(req.header('x-tenant') ?? req.body?.tenantId ?? 'DEV');
    const { userId, featureId, action } = req.body || {};
    if (!userId || !featureId || !action) {
      return res.status(400).json({ error: 'Missing userId/featureId/action' });
    }

    if (usePersistence) {
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
      ? await aggregateFromDb(userId, tenantId)
      : aggregateInMemory(userId, tenantId);

    res.json(usage);
  } catch (err: any) {
    res
      .status(500)
      .json({ error: 'usage_aggregate_failed', message: err?.message || String(err) });
  }
});

export default r;
