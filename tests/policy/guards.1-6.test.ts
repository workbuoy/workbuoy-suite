import { requiresProMode } from '../../src/core/proactivity/guards';
import { ProactivityMode } from '../../src/core/proactivity/modes';
import { buildProactivityContext } from '../../src/core/proactivity/context';
import { setSubscriptionForTenant, resetSubscriptionState } from '../../src/core/subscription/state';

describe('requiresProMode guard', () => {
  beforeEach(() => {
    resetSubscriptionState();
  });

  it('rejects when effective mode is below minimum', () => {
    const guard = requiresProMode(ProactivityMode.Kraken);
    const req: any = { proactivity: { effective: ProactivityMode.Ambisiøs, basis: ['mode:effective=4'] } };
    const res: any = {};
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    const next = jest.fn();

    guard(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    const payload = res.json.mock.calls[0][0];
    expect(payload.basis).toEqual(expect.arrayContaining(['mode:effective=4', 'guard:min=5']));
    expect(next).not.toHaveBeenCalled();
  });

  it('allows when effective mode meets requirement', () => {
    const guard = requiresProMode(ProactivityMode.Kraken);
    const req: any = { proactivity: { effective: ProactivityMode.Kraken, basis: ['mode:effective=5'] } };
    const res: any = {};
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    const next = jest.fn();

    guard(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('secure tenants are capped at <=3', () => {
    setSubscriptionForTenant('SEC', { plan: 'enterprise', secureTenant: true });
    const state = buildProactivityContext({ tenantId: 'SEC', requestedMode: ProactivityMode.Tsunami });
    expect(state.effective).toBeLessThanOrEqual(ProactivityMode.Proaktiv);
    expect(state.basis).toEqual(expect.arrayContaining(['tenant<=3', 'degraded:subscription', 'mode:effective=3']));
  });

  it('kill switch forces usynlig', () => {
    setSubscriptionForTenant('KILL', { plan: 'enterprise', killSwitch: true });
    const state = buildProactivityContext({ tenantId: 'KILL', requestedMode: ProactivityMode.Kraken });
    expect(state.effective).toBe(ProactivityMode.Usynlig);
    expect(state.basis).toEqual(expect.arrayContaining(['kill', 'degraded:kill', 'mode:effective=1']));
  });
});
