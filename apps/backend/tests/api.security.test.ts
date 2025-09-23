import request from 'supertest';
import app from '../src/app';

describe('Security middleware', () => {
  it('denies without api key', async () => {
    const res = await request(app).get('/api/v1/crm/pipelines');
    expect(res.status).toBe(401);
  });

  it('requires Idempotency-Key on POST', async () => {
    const res = await request(app)
      .post('/api/v1/crm/pipelines')
      .set('x-api-key', 'dev-123')
      .set('x-tenant-id', 'demo-tenant')
      .send({ tenant_id: 'demo-tenant', name: 'X' });
    expect(res.status).toBe(400);
  });
});
