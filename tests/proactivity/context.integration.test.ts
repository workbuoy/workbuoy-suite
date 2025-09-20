import { RoleRegistry } from '../../src/roles/registry';
import { buildProactivityContext } from '../../src/core/proactivity/context';
import { ProactivityMode } from '../../src/core/proactivity/modes';
import { resetSubscriptionState, setSubscriptionForTenant, ensureSubscriptionHydrated } from '../../src/core/subscription/state';

describe('Proactivity context integration', () => {
  beforeEach(() => {
    resetSubscriptionState();
  });

  it('applies min of requested, role cap, plan cap and policy cap', async () => {
    await setSubscriptionForTenant('TEN', { plan: 'enterprise', secureTenant: true });
    await ensureSubscriptionHydrated('TEN');
    const rr = new RoleRegistry(
      [
        { role_id: 'runner', canonical_title: 'Runner', featureCaps: { cashflow_forecast: 4 } },
      ] as any,
      [
        { id: 'cashflow_forecast', title: 'Cashflow', capabilities: ['demo.cap'], defaultAutonomyCap: 4 },
      ],
      []
    );

    const state = buildProactivityContext({
      tenantId: 'TEN',
      roleRegistry: rr,
      roleBinding: { userId: 'user', primaryRole: 'runner' },
      requestedMode: ProactivityMode.Tsunami,
      featureId: 'cashflow_forecast',
      policyCap: ProactivityMode.Kraken,
    });

    expect(state.effective).toBe(ProactivityMode.Proaktiv);
    expect(state.basis).toEqual(expect.arrayContaining([
      'tenantPlan:enterprise',
      'tenant<=3',
      'roleCap:cashflow_forecast=4',
      'degraded:proaktiv',
    ]));
  });
});
