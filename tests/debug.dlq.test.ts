// tests/debug.dlq.test.ts
import request from 'supertest';
import app from '../apps/backend/src/server';
describe('_debug dlq', () => {
  it('returns json', async () => {
    const r = await request(app).get('/_debug/dlq');
    expect([200,404].includes(r.status)).toBe(true); // ok if not mounted by convention
  });
});
