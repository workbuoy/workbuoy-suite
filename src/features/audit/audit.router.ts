// src/features/audit/audit.router.ts
import { Router } from 'express';
import { auditRepo } from '../../core/audit/audit.repo';
import { policyV2Guard } from '../../core/policyV2';
const r = Router();
r.get('/audit', policyV2Guard, async (_req,res)=>{
  const entries = await auditRepo.all();
  res.json({ entries });
});
export default r;
