// src/features/deals/deals.router.ts
import { Router } from 'express';
import { policyGuardWrite } from '../../core/policy/guard';
import { requireString } from '../../utils/require';
import { listDeals, upsertDeal, removeDeal } from './deals.service';

const r = Router();
r.get('/deals', async (_req,res)=> res.json(await listDeals()));
r.post('/deals', policyGuardWrite('deals'), async (req,res)=>{
  const d = await upsertDeal(req.body);
  res.json(d);
});
r.delete('/deals/:id', policyGuardWrite('deals'), async (req,res)=>{
  const dealId = requireString(req.params.id, 'req.params.id');
  const ok = await removeDeal(dealId);
  res.json({ ok });
});
export default r;
