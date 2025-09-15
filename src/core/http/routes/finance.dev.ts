import { Router } from 'express';
import { FinanceOrchestrator } from '../../../finance/orchestrator';
import { MockFinanceConnector } from '../../../connectors/finance.mock';
import { priorityBus } from '../../events/priorityBus';

export function financeDevRouter() {
  const r = Router();
  const finance = new FinanceOrchestrator(MockFinanceConnector);

  // Fire a crm.deal.closed event (dev)
  r.post('/api/_dev/deal-won', async (req, res) => {
    const { tenantId='T1', dealId='D-1', customerId='C-1', amount=100000, dueDate='2025-10-01', autonomy=4 } = req.body || {};
    priorityBus.publish({
      id: crypto.randomUUID?.() ?? String(Date.now()),
      type: 'crm.deal.closed',
      source: 'user',
      payload: { tenantId, dealId, customerId, amount, dueDate, autonomy },
      ts: new Date().toISOString(),
      correlationId: req.wb?.correlationId
    }, { priority: 'high' });
    res.status(202).json({ ok: true });
  });

  // Direct simulate prepareDraft (dev)
  r.post('/api/_dev/finance/prepareDraft', async (req, res) => {
    const ctx = { autonomy_level: Number(req.headers['x-autonomy-level'] ?? 4) as any, tenantId: req.wb?.tenantId ?? 'T1', role: 'finance' };
    const result = await finance.prepareDraft(req.body ?? {}, ctx);
    res.json(result);
  });

  return r;
}
