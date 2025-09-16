// src/features/audit/audit.router.ts
import { Router } from 'express';
import { auditRepo } from './audit.repo';
const r = Router();
r.get('/audit', async (req,res)=>{
  const id = String(req.query.id || '');
  const all = await auditRepo.all();
  const items = id ? all.filter(x=>x.targetId===id) : all;
  res.json(items);
});
export default r;
