import request from 'supertest';
import app from '../../apps/backend/src/server';

describe('server smoke', () => {
  it('health/ready/build', async () => {
    await request(app).get('/healthz').expect(200);
    await request(app).get('/readyz').expect(200);
    await request(app).get('/buildz').expect(200);
  });
  it('routes respond', async () => {
    await request(app).get('/api/crm/contacts').expect(200);
    await request(app).get('/api/tasks').expect(200);
    await request(app).get('/api/logs').expect(200);
  });
  it('buoy echo', async () => {
    const r = await request(app).post('/buoy/complete').send({ intent:'echo', params:{ hello:'world' } }).expect(200);
    expect(r.body?.correlationId).toBeTruthy();
    expect(Array.isArray(r.body?.explanations)).toBe(true);
  });
});
