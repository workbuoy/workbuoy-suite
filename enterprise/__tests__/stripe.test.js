jest.mock('stripe', ()=>{
  return function(){ return { checkout: { sessions: { create: jest.fn().mockResolvedValue({ id:'sess', url:'https://example.com' }) } } } };
});
const handler = require('../pages/api/stripe/create-checkout-session.js').default;

test('stripe checkout returns url', async()=>{
  const req = { method:'POST', body:{ kit_id:'slides-3up' }, headers:{ origin:'http://localhost:3000' } };
  let status=200, json;
  const res = { status:(c)=>({ json:(o)=>{ status=c; json=o; } }), json: (o)=>{ json=o; } };
  await handler(req,res);
  expect(json.url).toBeTruthy();
});
