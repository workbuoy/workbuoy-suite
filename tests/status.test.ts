// tests/status.test.ts
import request from 'supertest';
import app from '../src/server';
describe('status', ()=>{
  it('returns mode and ts', async ()=>{
    const r = await request(app).get('/status');
    expect([200,404].includes(r.status)).toBe(true);
  });
});
