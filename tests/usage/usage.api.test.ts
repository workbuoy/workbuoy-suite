import request from 'supertest';
process.env.FF_PERSISTENCE = process.env.FF_PERSISTENCE ?? 'false';
import app from '../../src/server';

describe('Usage router public paths', () => {
  it('POST /api/usage/feature', async () => {
    const res = await request(app)
      .post('/api/usage/feature')
      .set('content-type', 'application/json')
      .set('x-tenant', 'DEV')
      .send({ userId: 'u1', featureId: 'customer_health', action: 'open' });
    expect([200, 204]).toContain(res.status);
  });

  it('GET /api/usage/aggregate/:userId', async () => {
    const res = await request(app)
      .get('/api/usage/aggregate/u1')
      .set('x-tenant', 'DEV');
    expect([200, 204]).toContain(res.status);
  });
});
