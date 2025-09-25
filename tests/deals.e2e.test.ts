// tests/deals.e2e.test.ts
import request from 'supertest';
import app from '../apps/backend/src/server';

describe('deals', () => {
  const headers = { 'x-autonomy-level': '2', 'x-role': 'ops' };

  it('lists existing deals', async () => {
    const r = await request(app).get('/api/deals');
    expect(r.status).toBe(200);
    expect(Array.isArray(r.body)).toBe(true);
  });

  it('rejects writes without policy headers', async () => {
    const r = await request(app)
      .post('/api/deals')
      .send({ contactId: 'deal-test-contact', value: 10, status: 'open' });
    expect(r.status).toBe(400);
    expect(r.body?.code).toBe('E_POLICY_HEADERS_MISSING');
  });

  it('allows writes with required policy headers', async () => {
    const id = `deal-${Date.now()}`;
    const create = await request(app)
      .post('/api/deals')
      .set(headers)
      .send({ id, contactId: 'deal-test-contact', value: 42, status: 'open' });
    expect(create.status).toBe(200);
    expect(create.body?.id).toBe(id);

    const cleanup = await request(app).delete(`/api/deals/${id}`).set(headers);
    expect(cleanup.status).toBe(200);
  });
});
