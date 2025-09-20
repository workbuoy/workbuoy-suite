import request from 'supertest';
process.env.FF_PERSISTENCE = process.env.FF_PERSISTENCE ?? 'false';
import app from '../../src/server';

const itMaybe = process.env.FF_PERSISTENCE === 'true' ? it.skip : it;

describe('Features router public path', () => {
  itMaybe('GET /api/features/active responds (200 or 204)', async () => {
    const res = await request(app)
      .get('/api/features/active')
      .set('x-tenant', 'DEV')
      .set('x-user', 'u1')
      .set('x-role', 'sales_manager');
    expect([200, 204]).toContain(res.status);
  });
});
