import { Router } from 'express';
import { logIntent } from '../../intentLog';

export function manualCompleteRouter() {
  const r = Router();
  r.post('/api/manual-complete', async (req, res) => {
    const tenantId = (req as any).wb?.tenantId ?? 'T1';
    const { capability='ops.manual.complete', payload={}, outcome={} } = req.body || {};
    const policy = { allowed: true, explanation: 'manual-complete', basis:['ops:manual'] } as any;
    await logIntent({ tenantId, capability, payload, policy, mode:'simulate', outcome });
    res.json({ ok: true });
  });
  return r;
}
