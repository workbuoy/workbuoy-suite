import request from 'supertest';
import app from '../../src/server'; // adjust import if server entry differs

describe('Features router public path', () => {
  it('serves GET /api/features/active', async () => {
    const res = await request(app)
      .get('/api/features/active')
      .set('x-tenant', 'DEV')
      .set('x-user', 'u1')
      .set('x-role', 'sales_manager');
    expect([200, 204]).toContain(res.status);
  });
});
