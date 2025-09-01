jest.mock('stripe', ()=>{
  return function(){ return { checkout: { sessions: { create: jest.fn().mockResolvedValue({ id:'sess_pay', url:'https://checkout.test/pay' }) } } }; };
});
const handler = require('../pages/api/billing/create-payment.js').default;

test('create-payment returns url', async ()=>{
  const req = { method:'POST', body:{ module:'flex', taskType:'temp', amount:25 }, headers:{ origin:'http://localhost:3000' } };
  let json=null;
  const res = { status:(c)=>({ json:(o)=>{ json=o; } }), json:(o)=>{ json=o; } };
  await handler(req,res);
  expect(json.url).toBeTruthy();
});