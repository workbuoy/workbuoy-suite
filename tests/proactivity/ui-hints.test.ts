import { buildProactivityContext } from '../../src/core/proactivity/context';
import { ProactivityMode } from '../../src/core/proactivity/modes';
import { resetSubscriptionState, setSubscriptionForTenant } from '../../src/core/subscription/state';

describe('proactivity ui hints and chip', () => {
  beforeEach(() => {
    resetSubscriptionState();
  });

  it('exposes chip metadata for effective mode', () => {
    setSubscriptionForTenant('ENT', { plan: 'enterprise' });
    const state = buildProactivityContext({ tenantId: 'ENT', requestedMode: ProactivityMode.Tsunami });
    expect(state.effective).toBe(ProactivityMode.Tsunami);
    expect(state.uiHints.surface).toBe('dom-overlay');
    expect(state.chip).toEqual(expect.objectContaining({ key: 'tsunami', icon: '🌊' }));
  });

  it('maps compat header values to modern modes', () => {
    setSubscriptionForTenant('COMP', { plan: 'enterprise' });
    const state = buildProactivityContext({ tenantId: 'COMP', compatMode: 2 });
    expect(state.requested).toBe(ProactivityMode.Ambisiøs);
    expect(state.effective).toBe(ProactivityMode.Ambisiøs);
    expect(state.uiHints.surface).toBe('draft');
  });

  it('degrades ui hints when plan caps apply', () => {
    setSubscriptionForTenant('FLEX', { plan: 'flex' });
    const state = buildProactivityContext({ tenantId: 'FLEX', requestedMode: ProactivityMode.Tsunami });
    expect(state.effective).toBe(ProactivityMode.Ambisiøs);
    expect(state.uiHints.surface).toBe('draft');
    expect(state.chip.icon).toBe('✍️');
  });
});
