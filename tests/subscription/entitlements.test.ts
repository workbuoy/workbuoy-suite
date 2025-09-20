import { getPlanMaxMode } from '../../src/core/subscription/entitlements';
import {
  setSubscriptionForTenant,
  getSubscriptionCap,
  resetSubscriptionState,
  ensureSubscriptionHydrated,
} from '../../src/core/subscription/state';
import { ProactivityMode } from '../../src/core/proactivity/modes';

describe('subscription entitlements', () => {
  beforeEach(() => resetSubscriptionState());

  it('maps plans to expected caps', () => {
    expect(getPlanMaxMode('flex')).toBe(ProactivityMode.Ambisiøs);
    expect(getPlanMaxMode('secure')).toBe(ProactivityMode.Proaktiv);
    expect(getPlanMaxMode('enterprise')).toBe(ProactivityMode.Tsunami);
  });

  it('respects secure tenant flag and kill switch', async () => {
    await setSubscriptionForTenant('TEN', { plan: 'enterprise', secureTenant: true });
    await ensureSubscriptionHydrated('TEN');
    let cap = getSubscriptionCap('TEN');
    expect(cap.maxMode).toBe(ProactivityMode.Proaktiv);

    await setSubscriptionForTenant('TEN', { killSwitch: true });
    cap = getSubscriptionCap('TEN');
    expect(cap.maxMode).toBe(ProactivityMode.Usynlig);
  });

  it('allows temporary override', async () => {
    await setSubscriptionForTenant('TEN', { plan: 'enterprise', maxOverride: ProactivityMode.Kraken });
    await ensureSubscriptionHydrated('TEN');
    const cap = getSubscriptionCap('TEN');
    expect(cap.maxMode).toBe(ProactivityMode.Kraken);
  });
});
