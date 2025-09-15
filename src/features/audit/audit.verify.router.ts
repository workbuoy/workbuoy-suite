// src/features/audit/audit.verify.router.ts
import { Router } from 'express';
import { verifyAuditChain } from './audit.verify';
import { policyV2Guard } from '../../core/policyV2';
const r = Router();
r.get('/audit/verify', policyV2Guard, async (_req,res)=>{
  res.json(await verifyAuditChain());
});
export default r;
