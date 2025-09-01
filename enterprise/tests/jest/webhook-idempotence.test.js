/* @jest-environment node */
import Stripe from 'stripe';
test('Webhook signature verify and idempotence', async () => {
  const stripe = new Stripe('sk_test_dummy', { apiVersion: '2024-06-20' });
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
  const payload = { id:'evt_1', type:'checkout.session.completed', data:{ object:{ customer_email:'a@b.c', metadata:{ tenant_id:'t1', plan:'Solo Pro' } } } };
  const body = JSON.stringify(payload);
  const header = stripe.webhooks.generateTestHeaderString({ payload: body, secret: process.env.STRIPE_WEBHOOK_SECRET });
  const mod = await import('../../pages/api/stripe/webhook.js');
  // mock req as stream
  const { Readable } = await import('stream');
  const req = new Readable(); req.push(body); req.push(null); req.headers = { 'stripe-signature': header };
  let s=0, b=null; const res = { status:(x)=>{s=x; return res;}, json:(x)=>{b=x;} };
  await mod.default(req,res);
  expect(s).toBe(200);
  // Second time same id => idempotent
  const req2 = new Readable(); req2.push(body); req2.push(null); req2.headers = { 'stripe-signature': header };
  s=0; b=null;
  await mod.default(req2,res);
  expect(s).toBe(200);
  expect(b.idempotent).toBe(true);
});
