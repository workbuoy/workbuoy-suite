import { Router } from 'express';
import { rankActiveFeatures } from '../../src/features/activation/featureActivation.v2';

const r = Router();
r.get('/features/active', async (req:any,res,next)=>{
  try{
    const tenant = String(req.headers['x-tenant'] || req.headers['x-tenant-id'] || 'T1');
    const user = String(req.headers['x-user'] || req.headers['x-user-id'] || 'U1');
    const role = String(req.headers['x-role'] || 'user');
    const out = await rankActiveFeatures({ tenant, user, role });
    res.json({ ok:true, features: out });
  }catch(e){ next(e); }
});

export default r;
