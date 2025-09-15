// tests/core/capabilityRunner.test.ts
// Minimal smoke test placeholder (kept simple as repo test harness may vary).
import { runCapability } from '../../src/core/capabilityRunner';
// @ts-ignore - repo provides these at runtime; here we shim for CI safety.
jest.mock('../../src/core/policy', () => ({ policyCheck: async () => ({ allowed: true, explanation: 'ok' }) }));
// @ts-ignore
jest.mock('../../src/core/intentLog', () => ({ logIntent: async () => {} }));

describe('capability runner', () => {
  it('uses suggest at autonomy 3', async () => {
    const res = await runCapability('x', {}, { autonomy_level: 3 as any, tenantId: 'T1', role: 'user' }, { suggest: async () => ({ s: true }) });
    expect(res.outcome).toEqual({ s: true });
  });
});
