import { test, expect } from '@playwright/test';
import crypto from 'crypto';
const secret = process.env.CONNECTOR_WEBHOOK_SECRET || 'test';
function sign(body){ return crypto.createHmac('sha256', secret).update(body).digest('hex'); }
test('rejects replay', async ({ request }) => {
  const body = Buffer.from('{"a":1}');
  const nonce = 'abc123';
  const ts = Date.now().toString();
  const sig = sign(body);
  const headers = { 'x-wb-signature': sig, 'x-wb-timestamp': ts, 'x-wb-nonce': nonce, 'content-type':'application/json' };
  const res1 = await request.post('/api/connectors/webhook', { data: {a:1}, headers });
  expect(res1.status()).toBe(200);
  const res2 = await request.post('/api/connectors/webhook', { data: {a:1}, headers });
  expect(res2.status()).toBe(400);
});
