import { Router } from 'express';
import { FinanceOrchestrator } from '../finance/orchestrator';
import { policyGuardWrite } from '../core/policy/guard';
// The orchestrator instance should be created and passed in from your composition root.
// Here we create a tiny factory expecting a connector via req.app.get('financeConnector') for testability.

export function financeReminderRouter() {
  const r = Router();

  // POST /api/finance/reminder/suggest { invoiceId, customerEmail? }
  r.post('/reminder/suggest', policyGuardWrite('finance'), async (req: any, res, next) => {
    try {
      const { invoiceId, customerEmail } = req.body || {};
      const connector = req.app.get('financeConnector');
      if (!connector) return res.status(503).json({ error: 'finance connector unavailable' });
      const orch = new FinanceOrchestrator(connector);
      const autonomySource =
        (req as any).wb?.autonomyLevel ??
        (req as any).wb?.autonomy ??
        req.headers['x-autonomy-level'] ??
        req.headers['x-autonomy'];
      const autonomy = typeof autonomySource === 'number' ? autonomySource : Number(autonomySource ?? 0);
      const tenantId = String(req.headers['x-tenant-id'] ?? 'T1');
      const out = await orch.suggestReminder({ invoiceId, customerEmail }, { autonomy_level: autonomy as any, tenantId, role: 'finance' });
      res.json(out);
    } catch (e) { next(e); }
  });

  return r;
}
