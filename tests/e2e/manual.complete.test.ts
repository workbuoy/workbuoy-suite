import request from 'supertest';
import app from '../../src/server';

describe('POST /api/manual-complete', () => {
  it('logs manual completion and returns ok', async () => {
    const res = await request(app)
      .post('/api/manual-complete')
      .set('content-type','application/json')
      .send({ capability: 'finance.invoice.send', payload: { invoiceId:'INV-9' }, outcome:{ marked:true } })
      .expect(200);
    expect(res.body?.ok).toBe(true);
  });
});
