import handler from '../pages/api/integrations/list.js';

test('list returns catalog with status', async ()=>{
  const req = { method:'POST', headers:{'x-user-id':'u1'} };
  const res = { body:null, status: (c)=>({ json:v=>{ res.code=c; res.body=v; } }), json: v=>{ res.body=v; } };
  await handler(req,res);
  expect(res.body.ok).toBeTruthy();
  expect(Array.isArray(res.body.data.providers)).toBeTruthy();
});
