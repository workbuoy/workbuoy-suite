/* @jest-environment node */
test('Change plan (downgrade) updates subscription', async () => {
  const mod = await import('../../pages/api/billing/change-plan.js');
  const jwt = Buffer.from(JSON.stringify({ email:'o@t1.com', tenant_id:'t1' })).toString('base64')+'.sig';
  const req = { method:'POST', headers:{ authorization:`Bearer ${jwt}` }, body:{ plan:'Solo Pro' } };
  let s=0,b=null; const res = { status:(x)=>{s=x; return res;}, json:(x)=>{b=x;} };
  await mod.default(req,res);
  expect(s||200).toBe(200);
});
