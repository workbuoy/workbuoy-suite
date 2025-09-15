
import { FinanceOrchestrator } from '../finance/orchestrator';
import { priorityBus } from '../core/events/priorityBus';

export function registerOverdueToReminder(finance: FinanceOrchestrator) {
  priorityBus.subscribe('overdue2reminder', 'finance-reminder', async (ev) => {
    if (ev.type !== 'finance.overdue.detected') return;
    const { tenantId = 'T1', invoiceId } = ev.payload || {};
    await finance.suggestReminder({ invoiceId, tenantId }, {
      autonomy_level: 3 as any, tenantId, role: 'finance'
    });
  });
}
