import request from 'supertest';
import app from '../../src/server';

describe('metrics endpoint', () => {
  it('exposes proactivity metrics in Prometheus format', async () => {
    const res = await request(app).get('/metrics');
    expect(res.status).toBe(200);
    expect(res.text).toContain('proactivity_dummy');
  });
});
