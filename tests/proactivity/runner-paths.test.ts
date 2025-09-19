import { RoleRegistry } from '../../src/roles/registry';
import { runCapabilityWithRole } from '../../src/core/capabilityRunnerRole';
import { ProactivityMode } from '../../src/core/proactivity/modes';
import { setSubscriptionForTenant, resetSubscriptionState } from '../../src/core/subscription/state';

const rr = new RoleRegistry(
  [
    { role_id: 'tester', canonical_title: 'Tester', featureCaps: { 'cap-run': 6 } },
  ] as any,
  [
    { id: 'cap-run', title: 'Cap Runner', capabilities: ['demo'], defaultAutonomyCap: 6 },
  ],
  []
);

async function allowPolicy() {
  return { allowed: true, basis: ['policy:allow'] };
}

describe('runCapabilityWithRole', () => {
  beforeEach(() => {
    resetSubscriptionState();
    setSubscriptionForTenant('TEN', { plan: 'enterprise' });
  });

  it.each([
    { mode: ProactivityMode.Usynlig, invoked: 'observe' },
    { mode: ProactivityMode.Rolig, invoked: 'observe' },
    { mode: ProactivityMode.Proaktiv, invoked: 'suggest' },
    { mode: ProactivityMode.Ambisiøs, invoked: 'prepare' },
    { mode: ProactivityMode.Kraken, invoked: 'execute' },
    { mode: ProactivityMode.Tsunami, invoked: 'execute+overlay' },
  ])('invokes correct implementation for %s', async ({ mode, invoked }) => {
    const calls: string[] = [];
    const impl = {
      observe: jest.fn(async () => { calls.push('observe'); }),
      suggest: jest.fn(async () => { calls.push('suggest'); return 'suggest'; }),
      prepare: jest.fn(async () => { calls.push('prepare'); return 'prepare'; }),
      execute: jest.fn(async () => { calls.push('execute'); return 'execute'; }),
      overlay: jest.fn(async () => { calls.push('overlay'); return 'overlay'; }),
    };
    const logIntent = jest.fn(async () => {});

    const result = await runCapabilityWithRole(
      rr,
      'demo',
      'cap-run',
      {},
      { tenantId: 'TEN', roleBinding: { userId: 'user', primaryRole: 'tester' }, requestedMode: mode },
      impl,
      allowPolicy,
      logIntent
    );

    if (invoked === 'execute+overlay') {
      expect(impl.execute).toHaveBeenCalled();
      expect(impl.overlay).toHaveBeenCalled();
    } else {
      expect(calls).toContain(invoked);
    }
    expect(result.proactivity.effective).toBeLessThanOrEqual(mode);
    const logEvent = (logIntent.mock.calls[0] || [])[0];
    expect(logEvent?.proactivity?.basis?.some((entry: string) => entry.startsWith('requested:'))).toBe(true);
  });
});
