import { Router } from 'express';
import { recordFeatureUsage, aggregateFeatureUseCount } from '../../src/telemetry/usageSignals';
import { persistenceEnabled } from '../../src/core/config/dbFlag';

const r = Router();

r.post('/usage/feature', async (req, res) => {
  const { userId, featureId, action, ts, metadata } = req.body || {};
  const tenantId = String(req.header('x-tenant') ?? req.header('x-tenant-id') ?? req.body?.tenantId ?? 'DEV');

  if (!userId || !featureId || !action) {
    return res.status(400).json({ error: 'Missing userId/featureId/action' });
  }

  try {
    await recordFeatureUsage({ userId, featureId, action, ts, metadata, tenantId });
    return res.json({ ok: true, mode: persistenceEnabled() ? 'db' : 'memory' });
  } catch (err: any) {
    return res.status(500).json({ error: 'usage_record_failed', message: err?.message || String(err) });
  }
});

r.get('/usage/aggregate/:userId', async (req, res) => {
  const tenantId = String(req.header('x-tenant') ?? req.header('x-tenant-id') ?? 'DEV');
  try {
    const counts = await aggregateFeatureUseCount(String(req.params.userId), tenantId);
    if (!Object.keys(counts).length && !persistenceEnabled()) {
      return res.status(204).end();
    }
    return res.json({ tenantId, counts });
  } catch (err: any) {
    return res.status(500).json({ error: 'usage_aggregate_failed', message: err?.message || String(err) });
  }
});

export default r;
