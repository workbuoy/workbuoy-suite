import request from 'supertest';
import crypto from 'crypto';
import app from '../src/app';

function hmac(secret:string, body: any) {
  const raw = Buffer.from(JSON.stringify(body));
  return crypto.createHmac('sha256', secret).update(raw).digest('hex');
}

describe('Webhook signature verification', () => {
  test('HubSpot HMAC valid -> 202', async () => {
    const secret = 'dev-secret';
    const body = [{ properties: { firstname: 'Alice', email: 'a@a.com' } }];
    const sig = hmac(secret, body);
    const res = await request(app).post('/api/v1/connectors/hubspot/webhook')
      .set('X-HubSpot-Signature', sig)
      .send(body);
    expect(res.status).toBe(202);
  });

  test('Invalid HMAC -> 401', async () => {
    const body = { ok: true };
    const res = await request(app).post('/api/v1/connectors/salesforce/webhook')
      .set('X-Salesforce-Signature', 'bad')
      .send(body);
    expect(res.status).toBe(401);
  });
});
