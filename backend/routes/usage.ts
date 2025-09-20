import { Router } from 'express';
import { recordFeatureUsage, aggregateFeatureUseCount } from '../../src/telemetry/usageSignals';
const r = Router();

r.post('/usage/feature', (req,res)=>{
  const { userId, featureId, action } = req.body||{};
  if (!userId || !featureId || !action) return res.status(400).json({ error: 'Missing userId/featureId/action' });
  recordFeatureUsage({ userId, featureId, action, ts: new Date().toISOString() });
  res.json({ ok: true });
});

r.get('/usage/aggregate/:userId', (req,res)=>{
  res.json(aggregateFeatureUseCount(String(req.params.userId)));
});

export default r;
