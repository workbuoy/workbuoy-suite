// tests/correlationHeader.test.ts
import request from 'supertest';
import app from '../apps/backend/src/server';
describe('correlation header', ()=>{
  it('returns x-correlation-id', async ()=>{
    const r = await request(app).get('/status');
    expect(r.headers['x-correlation-id']).toBeDefined();
  });
});
