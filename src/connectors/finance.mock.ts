import type { FinanceConnector, FinanceAction } from './finance';

export const MockFinanceConnector: FinanceConnector = {
  async health() { return true; },
  async dryRun(_action: FinanceAction, _payload: any) {
    return { valid: true };
  },
  async simulate(action: FinanceAction, payload: any) {
    switch (action) {
      case 'invoice.createDraft':
        return { previewUrl: `https://preview/${payload?.dealId ?? 'draft'}.pdf` };
      case 'forecast.cashflow':
        return { forecast: [{ month: '2025-10', net: 420000 }] };
      default:
        return {};
    }
  },
  async execute(action: FinanceAction, _payload: any) {
    switch (action) {
      case 'invoice.createDraft':
        return { externalId: `INV-${Math.floor(Math.random() * 9999)}` };
      case 'invoice.send':
        return { status: 'sent' };
      case 'payment.record':
        return { status: 'recorded' };
      default:
        return {};
    }
  }
};
