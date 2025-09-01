/* @jest-environment node */
test('Member cannot access admin users endpoint', async () => {
  const base = 'http://localhost:8080';
  const memberJwt = Buffer.from(JSON.stringify({ email:'member@t1.example.com', tenant_id:'t1' })).toString('base64') + '.sig';
  const mod = await import('../../pages/api/portal/users.js');
  const req = { method:'POST', headers:{ authorization: `Bearer ${memberJwt}` }, body:{ email:'x@t1.example.com', role:'admin' } };
  let status=0, body=null; const res = { status:(s)=>{status=s; return res;}, json:(b)=>{body=b;} };
  await mod.default(req,res);
  expect(status).toBe(403);
});
