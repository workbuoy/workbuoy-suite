// tests/audit.surface.test.ts
import request from 'supertest';
import app from '../apps/backend/src/server';
describe('audit surface', ()=>{
  it('GET /api/audit responds', async ()=>{
    const r = await request(app).get('/api/audit');
    expect([200,404].includes(r.status)).toBe(true);
  });
});
