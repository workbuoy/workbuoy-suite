import request from 'supertest';
import app from '../../src/server';
import { resetSubscriptionState } from '../../src/core/subscription/state';

describe('Admin subscription API', () => {
  beforeEach(() => {
    resetSubscriptionState();
  });

  it('requires admin role', async () => {
    const res = await request(app).get('/api/admin/subscription').set('x-tenant', 'TEN');
    expect(res.status).toBe(403);
  });

  it('allows admin to inspect and update subscription', async () => {
    const inspect = await request(app)
      .get('/api/admin/subscription')
      .set('x-tenant', 'TEN')
      .set('x-roles', 'admin');

    expect(inspect.status).toBe(200);
    expect(inspect.body.plan).toBeDefined();

    const update = await request(app)
      .put('/api/admin/subscription')
      .set('x-tenant', 'TEN')
      .set('x-roles', 'admin')
      .send({ plan: 'enterprise', killSwitch: true });

    expect(update.status).toBe(200);
    expect(update.body.plan).toBe('enterprise');
    expect(update.body.killSwitch).toBe(true);
  });
});
