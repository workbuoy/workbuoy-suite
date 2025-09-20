
import request from 'supertest';
import app from '../../src/server';

describe('Finance Reminder suggest', () => {
  it('POST /api/finance/reminder/suggest returns draftEmail', async () => {
    const res = await request(app)
      .post('/api/finance/reminder/suggest')
      .set('x-autonomy-level','2')
      .set('x-role','ops')
      .set('content-type','application/json')
      .send({ invoiceId: 'INV-77' })
      .expect(200);
    expect(res.body?.outcome?.draftEmail).toMatch(/INV-77/);
  });

  it('POST /api/finance/reminder/suggest 400 when missing invoiceId', async () => {
    await request(app)
      .post('/api/finance/reminder/suggest')
      .set('x-autonomy-level','2')
      .set('x-role','ops')
      .set('content-type','application/json')
      .send({})
      .expect(400);
  });
});
