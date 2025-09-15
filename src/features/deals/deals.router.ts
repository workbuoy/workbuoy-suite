// src/features/deals/deals.router.ts
import { Router } from 'express';
import { policyV2Guard } from '../../core/policyV2';
import { listDeals, upsertDeal, removeDeal } from './deals.service';

const r = Router();
r.get('/deals', async (_req,res)=> res.json(await listDeals()));
r.post('/deals', policyV2Guard, async (req,res)=>{
  const d = await upsertDeal(req.body);
  res.json(d);
});
r.delete('/deals/:id', policyV2Guard, async (req,res)=>{
  const ok = await removeDeal(req.params.id);
  res.json({ ok });
});
export default r;
