
import request from 'supertest';
import app from '../../src/server';

describe('POST /buoy/complete', () => {
  it('NL route to prepareDraft returns ROI impact in explanations', async () => {
    const res = await request(app)
      .post('/buoy/complete')
      .set('content-type','application/json')
      .set('x-autonomy-level','4')
      .send({ text: 'lag fakturautkast for deal' })
      .expect(200);

    const exp = res.body?.explanations?.[0];
    expect(exp).toBeTruthy();
    expect(exp?.impact?.minutesSaved).toBeDefined();
  });

  it('Forbidden path returns 403 with explanations including policy basis', async () => {
    const res = await request(app)
      .post('/buoy/complete')
      .set('content-type','application/json')
      .set('x-autonomy-level','4')
      .send({ intent: 'finance.invoice.send', params: { invoiceId: 'INV-1' } })
      .expect(403);

    const exp = res.body?.explanations?.[0];
    expect(Array.isArray(exp?.policyBasis)).toBe(true);
  });
});
