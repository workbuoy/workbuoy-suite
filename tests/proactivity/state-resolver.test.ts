import { resolveEffectiveMode, degradeOnError } from '../../src/core/proactivity/state';
import { ProactivityMode } from '../../src/core/proactivity/modes';

describe('proactivity state resolver', () => {
  it('caps requested mode using degrade rail', () => {
    const res = resolveEffectiveMode({
      requested: ProactivityMode.Tsunami,
      caps: [
        { id: 'subscription:flex', mode: ProactivityMode.Ambisiøs },
        { id: 'role:feature', mode: ProactivityMode.Proaktiv },
      ],
    });
    expect(res.effective).toBe(ProactivityMode.Proaktiv);
    expect(res.basis).toEqual(expect.arrayContaining([
      'mode:requested=6',
      'mode:effective=3',
      'tenantPlan:flex',
      'roleCap:feature=3',
      'degraded:subscription',
      'degraded:role:feature',
    ]));
  });

  it('honours kill switch by forcing usynlig', () => {
    const res = resolveEffectiveMode({
      requested: ProactivityMode.Kraken,
      killSwitch: true,
      caps: [{ id: 'subscription:enterprise', mode: ProactivityMode.Tsunami }],
    });
    expect(res.effective).toBe(ProactivityMode.Usynlig);
    expect(res.basis).toEqual(expect.arrayContaining(['kill', 'degraded:kill', 'mode:effective=1']));
  });

  it('degrades along rail when error occurs', () => {
    expect(degradeOnError(ProactivityMode.Tsunami)).toBe(ProactivityMode.Kraken);
    expect(degradeOnError(ProactivityMode.Kraken)).toBe(ProactivityMode.Ambisiøs);
    expect(degradeOnError(ProactivityMode.Proaktiv)).toBe(ProactivityMode.Rolig);
    expect(degradeOnError(ProactivityMode.Rolig)).toBe(ProactivityMode.Usynlig);
    expect(degradeOnError(ProactivityMode.Usynlig)).toBe(ProactivityMode.Usynlig);
  });

  it('supports custom rails', () => {
    const rail = [ProactivityMode.Kraken, ProactivityMode.Proaktiv, ProactivityMode.Rolig] as const;
    const res = resolveEffectiveMode({ requested: ProactivityMode.Kraken, caps: [{ id: 'policy', mode: ProactivityMode.Proaktiv }], degradeRail: [...rail] });
    expect(res.degradeRail).toEqual([...rail]);
    expect(degradeOnError(ProactivityMode.Kraken, [...rail])).toBe(ProactivityMode.Proaktiv);
  });
});
