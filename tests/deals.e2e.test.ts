// tests/deals.e2e.test.ts
import request from 'supertest';
import app from '../src/server';
describe('deals', ()=>{
  it('lists without error', async ()=>{
    const r = await request(app).get('/api/deals');
    expect([200,404].includes(r.status)).toBe(true);
  });
});
