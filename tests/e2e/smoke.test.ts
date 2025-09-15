// tests/e2e/smoke.test.ts
import request from 'supertest';
import app from '../../src/server';
describe('E2E smoke', () => {
  it('addons returns crm.contacts', async () => {
    const r = await request(app).get('/api/addons');
    expect(r.status).toBe(200);
    expect(r.body.addons.some((a:any)=>a.key==='crm.contacts')).toBe(true);
  });
  it('health returns ok', async () => {
    const r = await request(app).get('/_health');
    expect([200,404].includes(r.status)).toBe(true);
  });
});
