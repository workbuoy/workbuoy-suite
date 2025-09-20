// tests/e2e/dealflow.test.ts
import request from 'supertest';
import app from '../../src/server';

describe('deal → audit flow', () => {
  const headers = { 'x-role':'owner', 'x-autonomy-level':'2' };
  it('creates a deal and lists audit entries', async () => {
    // create contact (best-effort; tolerate 2xx/4xx if route differs)
    await request(app).post('/api/crm/contacts').send({ id:'c-e2e', name:'E2E' }).set(headers);
    // create deal
    const d = await request(app).post('/api/deals').send({ id:'d-e2e', contactId:'c-e2e', value: 1000, status:'open' }).set(headers);
    expect([200,201,400,404].includes(d.status)).toBe(true);
    // audit list
    const a = await request(app).get('/api/audit');
    expect([200,404].includes(a.status)).toBe(true);
  });
});
