import { getPlanMaxMode } from '../../src/core/subscription/entitlements';
import { setSubscriptionForTenant, getSubscriptionCap, resetSubscriptionState } from '../../src/core/subscription/state';
import { ProactivityMode } from '../../src/core/proactivity/modes';

describe('subscription entitlements', () => {
  beforeEach(() => resetSubscriptionState());

  it('maps plans to expected caps', () => {
    expect(getPlanMaxMode('flex')).toBe(ProactivityMode.Ambisiøs);
    expect(getPlanMaxMode('secure')).toBe(ProactivityMode.Proaktiv);
    expect(getPlanMaxMode('enterprise')).toBe(ProactivityMode.Tsunami);
  });

  it('respects secure tenant flag and kill switch', () => {
    setSubscriptionForTenant('TEN', { plan: 'enterprise', secureTenant: true });
    let cap = getSubscriptionCap('TEN');
    expect(cap.maxMode).toBe(ProactivityMode.Proaktiv);

    setSubscriptionForTenant('TEN', { killSwitch: true });
    cap = getSubscriptionCap('TEN');
    expect(cap.maxMode).toBe(ProactivityMode.Usynlig);
  });

  it('allows temporary override', () => {
    setSubscriptionForTenant('TEN', { plan: 'enterprise', maxOverride: ProactivityMode.Kraken });
    const cap = getSubscriptionCap('TEN');
    expect(cap.maxMode).toBe(ProactivityMode.Kraken);
  });
});
