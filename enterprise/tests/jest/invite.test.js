/* @jest-environment node */
test('Invite token create and accept', async () => {
  process.env.WB_INVITES_ENABLED='true';
  const base = 'http://localhost:8080';
  // owner JWT
  const ownerJwt = Buffer.from(JSON.stringify({ email:'owner@t1.example.com', tenant_id:'t1' })).toString('base64') + '.sig';
  const inviteMod = await import('../../pages/api/org/invite.js');
  const req1 = { method:'POST', headers:{ authorization:`Bearer ${ownerJwt}`, origin: base }, body:{ email:'admin@t1.example.com', role:'admin' } };
  let s1=0, b1=null; const res1={ status:(s)=>{s1=s; return res1;}, json:(b)=>{b1=b;} };
  await inviteMod.default(req1,res1);
  expect(s1).toBe(200);
  expect(b1.invite_token).toBeTruthy();

  const acceptMod = await import('../../pages/api/org/invite-accept.js');
  const req2 = { method:'POST', body:{ token:b1.invite_token } };
  let s2=0, b2=null; const res2={ status:(s)=>{s2=s; return res2;}, json:(b)=>{b2=b;} };
  await acceptMod.default(req2,res2);
  expect(s2).toBe(200);
  expect(b2.token).toBeTruthy();
  expect(b2.role).toBe('admin');
});
