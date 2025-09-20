import { Router } from 'express';
import { logIntent } from '../core/intentLog';
import { policyGuardWrite } from '../core/policy/guard';

export function manualCompleteRouter() {
  const r = Router();
  r.post('/manual-complete', policyGuardWrite('manual'), async (req: any, res, next) => {
    try {
      const { capability, payload, note } = req.body || {};
      const tenantId = String(req.headers['x-tenant-id'] ?? 'T1');
      const policy = { allowed: false, explanation: 'manual-complete', basis: ['ops:manual'] };
      const outcome = { note, manual: true };
      const id = await logIntent({ tenantId, capability: capability || 'ops.manual.complete', payload, policy, mode: 'simulate', outcome });
      res.json({ ok: true, intentId: id });
    } catch (e) { next(e); }
  });
  return r;
}
