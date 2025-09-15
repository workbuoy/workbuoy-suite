/**
 * On finance.overdue.detected, ask orchestrator to suggest a reminder email.
 */
import type { FinanceOrchestrator } from '../finance/orchestrator';

type Event = { type: string; payload: any };

export interface SimpleBus {
  subscribe(topic: string, consumerId: string, handler: (ev: Event) => Promise<void> | void): void;
}

export function registerOverdueToReminder(bus: SimpleBus, finance: FinanceOrchestrator) {
  bus.subscribe('finance.overdue.detected', 'overdue2reminder', async (ev: Event) => {
    if (ev.type !== 'finance.overdue.detected') return;
    const { invoiceId, tenantId, customerEmail } = ev.payload || {};
    await finance.suggestReminder({ invoiceId, customerEmail }, { autonomy_level: 3, tenantId: tenantId ?? 'T1', role: 'finance' });
  });
}
