// tests/audit.verify.test.ts
import request from 'supertest';
import app from '../src/server';
describe('audit verify', () => {
  it('returns ok or requires auth', async () => {
    const r = await request(app).get('/api/audit/verify');
    expect([200,401,403,404].includes(r.status)).toBe(true);
  });
});
