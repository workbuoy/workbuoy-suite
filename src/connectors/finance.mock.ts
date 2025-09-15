import type { FinanceConnector } from './finance';

function randId(prefix:string){ return `${prefix}-${Math.floor(Math.random()*99999)}`; }

export const MockFinanceConnector: FinanceConnector = {
  async health(){ return true; },
  async dryRun(){ return { valid: true }; },
  async simulate(action, payload){
    if (action === 'invoice.createDraft') {
      const id = payload?.dealId || 'draft';
      return { previewUrl: `https://preview.workbuoy.local/${id}.pdf` };
    }
    if (action === 'forecast.cashflow') {
      return { forecast: [{ month: '2025-10', net: 420000 }] };
    }
    return {};
  },
  async execute(action, payload){
    if (action === 'invoice.createDraft') return { externalId: randId('INV') };
    if (action === 'invoice.send') return { status: 'sent' };
    if (action === 'payment.record') return { status: 'recorded' };
    return {};
  }
};
