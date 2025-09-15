import { runCapability } from '../../src/core/capabilityRunner';

// Patch environment for deterministic policy (no OPA)
process.env.OPA_URL = '';

describe('capabilityRunner', () => {
  const baseCtx = { autonomy_level: 3 as const, tenantId: 'T1', role: 'finance' };

  it('L1/L2: observe only (no execute)', async () => {
    let observed = 0; let executed = 0;
    const impl = {
      observe: async () => { observed++; },
      execute: async () => { executed++; return { ok: true }; }
    };
    await runCapability('finance.invoice.send', {}, { ...baseCtx, autonomy_level: 1 }, impl);
    await runCapability('finance.invoice.send', {}, { ...baseCtx, autonomy_level: 2 }, impl);
    expect(observed).toBe(2);
    expect(executed).toBe(0);
  });

  it('L3: suggest path used', async () => {
    const res = await runCapability('finance.payment.suggestReminder', {}, { ...baseCtx, autonomy_level: 3 }, {
      suggest: async () => ({ suggested: true })
    });
    expect(res.outcome?.suggested).toBe(true);
    expect(res.mode).toBe('simulate');
  });

  it('L4: prepare path used', async () => {
    const res = await runCapability('finance.invoice.prepareDraft', {}, { ...baseCtx, autonomy_level: 4 }, {
      prepare: async () => ({ previewUrl: 'https://preview/draft.pdf' })
    });
    expect((res.outcome as any)?.previewUrl).toMatch(/preview/);
  });

  it('L5: execute when possible', async () => {
    const res = await runCapability('finance.invoice.send', {}, { ...baseCtx, autonomy_level: 5 }, {
      execute: async () => ({ status: 'sent' } as any)
    });
    expect((res.outcome as any)?.status).toBe('sent');
    expect(res.mode).toBe('integration');
  });

  it('L5: degrade to prepare on failure', async () => {
    const res = await runCapability('finance.invoice.send', {}, { ...baseCtx, autonomy_level: 5 }, {
      execute: async () => { throw new Error('boom'); },
      prepare: async () => ({ preview: true } as any)
    });
    expect((res.outcome as any)?.preview).toBe(true);
    expect((res.outcome as any)?.degraded).toBe(true);
  });

  it('Kill switch blocks regardless of autonomy', async () => {
    process.env.KILL_SWITCH_ALL = '1';
    const res = await runCapability('finance.invoice.send', {}, { ...baseCtx, autonomy_level: 6 }, {
      execute: async () => ({ status: 'sent' } as any)
    });
    expect(res.policy.allowed).toBe(false);
    expect(res.policy.explanation).toMatch(/kill switch/);
    process.env.KILL_SWITCH_ALL = '0';
  });
});
