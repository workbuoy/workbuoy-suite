import handler from '../pages/api/integrations/admin-consent-link.js';

test('admin-consent-link returns url', async ()=>{
  const req = { method:'GET', query:{ provider:'microsoft-graph' } };
  const res = { body:null, json: v=>{ res.body=v; }, status: (c)=>({ json: v=>{ res.body=v; } }) };
  await handler(req,res);
  expect(res.body.ok).toBeTruthy();
  expect(typeof res.body.data.url).toBe('string');
});
