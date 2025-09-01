import request from 'supertest';
import app from '../src/app';

describe('Connectors webhooks', () => {
  it('accepts salesforce webhook', async () => {
    const res = await request(app)
      .post('/api/v1/connectors/salesforce/webhook')
      .set('x-tenant-id','demo-tenant')
      .send({ Id: '001', Name: 'Acme Opp', Amount: 10, CurrencyIsoCode: 'USD', StageName: 'Prospecting' });
    expect(res.status).toBe(202);
    expect(res.body.accepted).toBeGreaterThan(0);
  });

  it('config endpoint requires admin', async () => {
    const res = await request(app)
      .post('/api/v1/connectors/hubspot/config')
      .set('x-api-key','dev-123')
      .set('x-tenant-id','demo-tenant')
      .set('x-roles','viewer')
      .send({ token: 'x' });
    expect(res.status).toBe(403);
  });
});
