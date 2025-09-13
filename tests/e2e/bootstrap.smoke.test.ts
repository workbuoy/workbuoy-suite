import request from 'supertest';
import app from '../../src/server';

describe('bootstrap + routes smoke', () => {
  it('healthz & readyz', async () => {
    const h = await request(app).get('/healthz'); expect(h.status).toBe(200);
    const r = await request(app).get('/readyz'); expect(r.status).toBe(200);
  });

  it('CRM list (empty)', async () => {
    const res = await request(app).get('/api/crm/contacts'); expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('items');
  });

  it('Tasks list (empty)', async () => {
    const res = await request(app).get('/api/tasks'); expect(res.status).toBe(200);
  });

  it('Logs list (empty)', async () => {
    const res = await request(app).get('/api/logs'); expect(res.status).toBe(200);
  });

  it('Buoy echo', async () => {
    const res = await request(app).post('/buoy/complete').send({ intent:'echo', params:{ ok:true } });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('correlationId');
  });

  it('Write policy denies when autonomy=1', async () => {
    const res = await request(app).post('/api/tasks').set('x-autonomy-level','1').send({ title:'A' });
    expect(res.status).toBe(403);
    const ex = res.body?.error?.explanations || [];
    expect(Array.isArray(ex)).toBe(true);
  });
});
