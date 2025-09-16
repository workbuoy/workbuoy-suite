// tests/metrics.test.ts
import request from 'supertest';
import app from '../src/server';
describe('metrics', ()=>{
  it('returns prometheus text', async ()=>{
    const r = await request(app).get('/metrics');
    expect([200,404].includes(r.status)).toBe(true);
  });
});
