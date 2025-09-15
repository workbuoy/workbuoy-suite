import { policyCheck } from '../../src/core/policy';

describe('policyCheck (local fallback)', () => {
  it('finance.invoice.prepareDraft: allows at autonomy >=4 and returns impact', async () => {
    const res = await policyCheck(
      { capability: 'finance.invoice.prepareDraft', payload: {} },
      { autonomy_level: 4, tenantId: 'T1', role: 'finance' }
    );
    expect(res.allowed).toBe(true);
    expect(res.impact?.minutesSaved).toBe(18);
  });

  it('finance.invoice.send: denies below 5 with ask_approval', async () => {
    const res = await policyCheck(
      { capability: 'finance.invoice.send', payload: {} },
      { autonomy_level: 4, tenantId: 'T1', role: 'finance' }
    );
    expect(res.allowed).toBe(false);
    expect(res.degraded_mode).toBe('ask_approval');
  });
});
