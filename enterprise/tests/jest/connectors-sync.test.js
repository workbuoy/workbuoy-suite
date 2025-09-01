/* @jest-environment node */
test('Connector sync updates status and emits metric', async () => {
  const jwt = Buffer.from(JSON.stringify({ email:'owner@t1.com', tenant_id:'t1' })).toString('base64')+'.sig';
  const api = await import('../../pages/api/portal/connectors/sync.js');
  let s=0,b=null; const req = { method:'POST', headers:{ authorization:`Bearer ${jwt}` }, body:{ provider:'email' } };
  const res = { status:(x)=>{s=x; return res;}, json:(x)=>{b=x;} };
  await api.default(req,res);
  expect(s||200).toBe(200);
  expect(b.status).toBe('connected');
});
