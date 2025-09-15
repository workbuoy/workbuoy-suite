// Jest test (kept minimal; repo harness may vary)
import { FinanceOrchestrator } from '../../src/finance/orchestrator';

// Mock runCapability to directly call the provided impl.prepare and wrap outcome
jest.mock('../../src/core/capabilityRunner', () => ({
  runCapability: async (_id: string, _payload: any, _ctx: any, impl: any) => {
    const outcome = impl.prepare ? await impl.prepare() : undefined;
    return { outcome, policy: { allowed: true, explanation: 'ok' } };
  }
}));

// Mock connector with a deterministic simulate response
const connector = {
  health: async () => true,
  dryRun: async () => ({ valid: true }),
  simulate: async (action: string, payload: any) => {
    if (action === 'invoice.createDraft') return { previewUrl: `https://preview/${payload?.dealId ?? 'draft'}.pdf` };
    if (action === 'forecast.cashflow') return { forecast: [{ month: '2025-10', net: 420000 }] };
    return {};
  },
  execute: async () => ({ status: 'noop' })
};

describe('FinanceOrchestrator', () => {
  it('prepareDraft returns previewUrl (simulate-first)', async () => {
    const orch = new FinanceOrchestrator(connector as any);
    const res = await orch.prepareDraft({ dealId: 'D-1' }, { autonomy_level: 4, tenantId: 'T1', role: 'sales' });
    expect(res.outcome?.previewUrl).toBe('https://preview/D-1.pdf');
  });
});
