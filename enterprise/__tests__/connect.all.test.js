import handler from '../pages/api/integrations/connect-all.js';

test('connect-all starts multiple providers', async ()=>{
  const req = { method:'POST', headers:{'x-user-id':'u1'}, body:{ providers:['google-workspace','microsoft-graph'] } };
  const res = { body:null, json: v=>{ res.body=v; }, status: (c)=>({ json: v=>{ res.body=v; } }) };
  await handler(req,res);
  expect(res.body.ok).toBeTruthy();
  expect(res.body.data.started).toBeGreaterThanOrEqual(2);
});
