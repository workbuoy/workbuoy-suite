import request from 'supertest';
import app from '../../apps/backend/src/server';
import { resetSubscriptionState, setSubscriptionForTenant } from '../../src/core/subscription/state';
import { resetProactivityTelemetry, getRecentProactivityEvents } from '../../src/core/proactivity/telemetry';
import { ProactivityMode } from '../../src/core/proactivity/modes';

describe('GET /api/proactivity/state', () => {
  beforeEach(() => {
    resetSubscriptionState();
    resetProactivityTelemetry();
  });

  it('returns requested and effective modes with ui hints', async () => {
    setSubscriptionForTenant('TENANT', { plan: 'flex' });
    const res = await request(app)
      .get('/api/proactivity/state')
      .set('x-tenant', 'TENANT')
      .set('x-user', 'user-1')
      .set('x-role', 'sales_rep')
      .set('x-proactivity', 'tsunami');

    expect(res.status).toBe(200);
    expect(res.body.requestedKey).toBe('tsunami');
    expect(res.body.effectiveKey).toBe('ambisiøs');
    expect(res.body.uiHints).toHaveProperty('callToAction');
    expect(res.body.uiHints.surface).toBe('draft');
    expect(res.body.chip).toEqual(expect.objectContaining({ key: 'ambisiøs', icon: '✍️' }));
    expect(res.body.basis).toEqual(expect.arrayContaining(['mode:requested=6', 'mode:effective=4']));
    expect(res.body.subscription.plan).toBe('flex');
    const events = getRecentProactivityEvents(1);
    expect(events[0].tenantId).toBe('TENANT');
    expect(events[0].requestedKey).toBe('tsunami');
  });

  it('POST allows overriding requested mode', async () => {
    setSubscriptionForTenant('TENANT', { plan: 'enterprise' });
    const res = await request(app)
      .post('/api/proactivity/state')
      .set('x-tenant', 'TENANT')
      .set('x-user', 'user-2')
      .set('x-role', 'sales_rep')
      .send({ requestedMode: ProactivityMode.Kraken });

    expect(res.status).toBe(200);
    expect(res.body.effective).toBe(ProactivityMode.Kraken);
    expect(res.body.uiHints.surface).toBe('backstage');
    expect(res.body.basis).toEqual(expect.arrayContaining(['mode:requested=5', 'mode:effective=5']));
  });
});
