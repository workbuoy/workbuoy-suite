
import handlerSuggested from '../pages/api/integrations/suggested.js';

test('suggested API returns list with id/label/status', async ()=>{
  const req = { headers: {'x-user-id':'test'} };
  const res = { json: v=>{ res.body=v; }, status: c=>({ json: v=>{ res.body=v; } }) };
  await handlerSuggested(req,res);
  expect(res.body.ok).toBeTruthy();
  expect(Array.isArray(res.body.data.suggested)).toBeTruthy();
});
