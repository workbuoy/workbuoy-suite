import { Router } from 'express';
import * as store from './log.store';
import { append as auditAppend, verify } from '../../core/audit/immutableLog';
import { policyV2Guard as policyGuard } from '../../core/policyV2/guard';

const router = Router();

router.get('/', (req, res)=>{
  const limit = Number(req.query.limit || 50);
  res.json({ items: store.list(limit) });
});

router.post('/', policyGuard, (req, res)=>{
  const { level='info', message } = req.body || {};
  const entry = store.append({ level, message, correlationId: req.wb?.correlationId });
  auditAppend(req.wb?.correlationId || 'unknown', 'log.append', { id: entry.id });
  res.status(201).json(entry);
});

// Audit verify (admin-ish)
router.get('/../audit/verify', (_req, res)=>{
  const ok = verify();
  res.status(ok ? 200 : 500).json({ ok });
});

export default router;
