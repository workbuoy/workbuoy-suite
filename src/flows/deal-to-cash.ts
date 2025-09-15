import type { FinanceOrchestrator } from '../finance/orchestrator';

type Event = { type: string; payload: any };

export interface SimpleBus {
  subscribe(topic: string, consumerId: string, handler: (ev: Event) => Promise<void> | void): void;
}

export function registerDealToCash(bus: SimpleBus, finance: FinanceOrchestrator) {
  bus.subscribe('crm.deal.closed', 'deal2inv', async (ev: Event) => {
    if (ev.type !== 'crm.deal.closed') return;
    await finance.prepareDraft({
      tenantId: ev.payload.tenantId,
      dealId: ev.payload.dealId,
      customerId: ev.payload.customerId,
      amount: ev.payload.amount,
      dueDate: ev.payload.dueDate
    }, { autonomy_level: ev.payload.autonomy ?? 4, tenantId: ev.payload.tenantId, role: ev.payload.role ?? 'sales' });
  });
}
