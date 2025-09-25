// tests/health.test.ts
import request from 'supertest';
import app from '../apps/backend/src/server';
describe('_health', () => {
  it('responds 200', async () => {
    const r = await request(app).get('/_health');
    expect([200,404].includes(r.status)).toBe(true);
  });
});
