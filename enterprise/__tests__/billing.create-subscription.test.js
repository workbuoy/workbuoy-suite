jest.mock('stripe', ()=>{
  return function(){ return { checkout: { sessions: { create: jest.fn().mockResolvedValue({ id:'sess_123', url:'https://checkout.test' }) } } }; };
});
const handler = require('../pages/api/billing/create-subscription.js').default;

test('create-subscription validates and returns url', async ()=>{
  const req = { method:'POST', body:{ module:'core', plan:'individual', trialDays:7 }, headers:{ origin:'http://localhost:3000' } };
  let json=null, status=200;
  const res = { status:(c)=>({ json:(o)=>{ status=c; json=o; } }), json:(o)=>{ json=o; } };
  await handler(req,res);
  expect(json.url).toBeTruthy();
});