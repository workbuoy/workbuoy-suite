
import { Router } from 'express';
import { priorityBus } from '../../events/priorityBus';

export function financeOverdueDevRouter() {
  const r = Router();
  r.post('/api/_dev/finance/overdue', async (req, res) => {
    const { tenantId='T1', invoiceId='INV-1', autonomy=3 } = req.body || {};
    priorityBus.publish({
      id: crypto.randomUUID?.() ?? String(Date.now()),
      type: 'finance.overdue.detected',
      source: 'user',
      payload: { tenantId, invoiceId, autonomy },
      ts: new Date().toISOString(),
      correlationId: (req as any).wb?.correlationId
    }, { priority: 'high' });
    res.status(202).json({ ok: true });
  });
  return r;
}
