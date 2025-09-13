import request from 'supertest';
import app from '../../src/server';

describe('server bootstrap smoke', () => {
  it('healthz and readyz return 200', async () => {
    const h = await request(app).get('/healthz');
    expect(h.status).toBe(200);
    const r = await request(app).get('/readyz');
    expect(r.status).toBe(200);
  });

  it('GET /api/tasks returns 200 (or empty list)', async () => {
    const res = await request(app).get('/api/tasks');
    expect([200, 204]).toContain(res.status);
  });

  it('GET /api/crm/contacts returns 200 (or empty list)', async () => {
    const res = await request(app).get('/api/crm/contacts');
    expect([200, 204]).toContain(res.status);
  });

  it('GET /api/logs returns 200 (or empty list)', async () => {
    const res = await request(app).get('/api/logs');
    expect([200, 204]).toContain(res.status);
  });

  it('POST /buoy/complete returns 200 with correlationId when available', async () => {
    const res = await request(app).post('/buoy/complete').send({ intent: 'echo', params: { hello: 'world' } });
    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body).toHaveProperty('correlationId');
    }
  });

  it('Write policy gating on tasks (autonomy=1) should deny', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('x-autonomy-level', '1')
      .set('x-role-id', 'user')
      .send({ title: 'Test', status: 'todo' });
    expect([401, 403, 404]).toContain(res.status);
    if (res.status !== 404) {
      const explanations = res.body?.explanations || res.body?.error?.explanations || [];
      expect(Array.isArray(explanations)).toBe(true);
    }
  });
});
