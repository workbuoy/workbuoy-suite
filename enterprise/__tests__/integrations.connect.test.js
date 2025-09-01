
import handlerConnect from '../pages/api/integrations/connect.js';

test('connect API returns connected in dev', async ()=>{
  const req = { method:'POST', headers: {'x-user-id':'test'}, body:{provider:'slack'} };
  const res = { _status:200, status: c=>{res._status=c; return res;}, json: v=>{ res.body=v; } };
  await handlerConnect(req,res);
  expect(res._status).toBe(200);
  expect(res.body.ok).toBeTruthy();
  expect(res.body.data.status==='connected' || res.body.data.status==='pending').toBeTruthy();
});
