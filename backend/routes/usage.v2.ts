import { Router } from 'express';
import { recordFeatureUsage, aggregateFeatureUseCount } from '../../src/telemetry/usageSignals.db.v2';

const r = Router();

r.post('/usage/feature', async (req:any,res,next)=>{
  try{
    const { userId, featureId, action } = req.body || {};
    await recordFeatureUsage({ userId, featureId, action });
    res.status(204).send();
  }catch(e){ next(e); }
});

r.get('/usage/aggregate/:userId', async (req:any,res,next)=>{
  try{
    const rows = await aggregateFeatureUseCount(String(req.params.userId));
    res.json({ ok:true, usage: rows });
  }catch(e){ next(e); }
});

export default r;
