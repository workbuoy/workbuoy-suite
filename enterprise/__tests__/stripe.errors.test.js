jest.mock('stripe', ()=>{
  return function(){
    return { checkout: { sessions: { create: jest.fn().mockRejectedValue(new Error('boom')) } } };
  };
});
const handler = require('../pages/api/stripe/create-checkout-session.js').default;

test('stripe checkout handles error', async()=>{
  const req = { method:'POST', body:{ kit_id:'slides-3up' }, headers:{ origin:'http://localhost:3000' } };
  let status, json;
  const res = { status:(c)=>({ json:(o)=>{ status=c; json=o; } }), json:(o)=>{ status=200; json=o; } };
  await handler(req,res);
  expect(status).toBe(500);
  expect(json.error).toBe('stripe_error');
});
