import request from 'supertest';
import app from '../../apps/backend/src/server';

describe('policy guard on /api/audit', () => {
  it('rejects missing autonomy headers', async () => {
    const res = await request(app)
      .post('/api/audit')
      .set('content-type', 'application/json')
      .send({ route: '/test', method: 'POST' });

    expect(res.status).toBe(400);
    expect(res.body?.code).toBe('E_POLICY_HEADERS_MISSING');
  });

  it('allows audit append with autonomy ≥2 and role header', async () => {
    const res = await request(app)
      .post('/api/audit')
      .set('x-autonomy-level', '2')
      .set('x-role', 'ops')
      .set('content-type', 'application/json')
      .send({ route: '/ok', method: 'POST' });

    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(300);
    expect(res.body?.ok).toBe(true);
  });
});
