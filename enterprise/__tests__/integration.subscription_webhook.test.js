process.env.NODE_ENV='test';
const webhook = require('../pages/api/stripe/webhook.js').default;

test('webhook subscription created triggers funnel', async ()=>{
  const ev = { type:'customer.subscription.created', data:{ object:{ status:'trialing', current_period_end: Math.floor(Date.now()/1000)+604800, trial_end: Math.floor(Date.now()/1000)+604800 } } };
  const req = { method:'POST', headers:{}, on:()=>{} };
  let body = Buffer.from(JSON.stringify(ev));
  req.headers={};
  req.on = (evName, cb)=>{ if(evName==='data'){ cb(body); } if(evName==='end'){ cb(); } };
  let status=200, json;
  const res = { status:(c)=>({ send:(m)=>{ status=c; }, json:(o)=>{ json=o; } }), json:(o)=>{ json=o; } };
  await webhook(req,res);
  expect(json && json.received).toBe(true);
});