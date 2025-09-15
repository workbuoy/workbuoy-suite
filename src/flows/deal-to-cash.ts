import type { FinanceOrchestrator } from '../finance/orchestrator';
import { priorityBus } from '../core/events/priorityBus'; // assumed existing from PR3

export function registerDealToCash(finance: FinanceOrchestrator) {
  // Subscribe once
  priorityBus.subscribe('deal2inv', 'finance-orchestrator', async (ev) => {
    if (ev.type !== 'crm.deal.closed') return;
    const { tenantId, autonomy = 4, role = 'sales', dealId, customerId, amount, dueDate } = ev.payload || {};
    await finance.prepareDraft({ tenantId, dealId, customerId, amount, dueDate }, {
      autonomy_level: autonomy, tenantId, role
    });
  });
}
