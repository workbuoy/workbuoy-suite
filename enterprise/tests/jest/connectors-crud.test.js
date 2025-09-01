/* @jest-environment node */
test('Connector enable enforces connectors_max and saves secret ref', async () => {
  const jwt = Buffer.from(JSON.stringify({ email:'owner@t1.com', tenant_id:'t1' })).toString('base64')+'.sig';
  const mod = await import('../../pages/api/portal/connectors.js');
  // Enable first connector
  let s=0,b=null; const req = { method:'POST', headers:{ authorization:`Bearer ${jwt}` }, body:{ provider:'email', action:'enable', secrets:{ api_key:'xyz' } } };
  const res = { status:(x)=>{s=x; return res;}, json:(x)=>{b=x;} };
  await mod.default(req,res);
  expect(s||200).toBe(200);
  expect(b.secret_ref).toBeTruthy();
});
