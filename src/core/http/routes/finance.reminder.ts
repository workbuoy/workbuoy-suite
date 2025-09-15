
import { Router } from 'express';
import { FinanceOrchestrator } from '../../../finance/orchestrator';
import { MockFinanceConnector } from '../../../connectors/finance.mock';

export function financeReminderRouter() {
  const r = Router();
  const finance = new FinanceOrchestrator(MockFinanceConnector);

  r.post('/api/finance/reminder/suggest', async (req, res) => {
    const autonomy = Number(req.headers['x-autonomy-level'] ?? 3) as any;
    const tenantId = (req as any).wb?.tenantId ?? 'T1';
    const role = (req as any).wb?.roleId ?? 'finance';
    const { invoiceId } = req.body || {};

    if (!invoiceId) return res.status(400).json({ error: 'invoiceId required' });

    const result = await finance.suggestReminder({ invoiceId, tenantId }, { autonomy_level: autonomy, tenantId, role });
    return res.status(result.policy.allowed ? 200 : 403).json(result);
  });

  return r;
}
