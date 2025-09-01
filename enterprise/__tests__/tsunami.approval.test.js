const handler = require('../pages/api/modes/tsunami/approve.js').default;
const token = require('../lib/tokens.js');

const auth = () => 'Bearer ' + (token.sign?token.sign({email:'test@example.com'}):'dev');

test('approval endpoint denies when flag off', async()=>{
  process.env.TSUNAMI_WRITEBACK_ENABLED = 'false';
  const req = { method:'POST', headers:{ authorization: auth() }, body:{ approvals:['privacy_sensitive','write_system_high_risk'], plan:[] } };
  let status=200, json;
  const res = { status:(c)=>({ json:(o)=>{ status=c; json=o; } }), json:(o)=>{ json=o; } };
  await handler(req,res);
  expect(status).toBe(403);
});

test('approval endpoint writes when flag on', async()=>{
  process.env.TSUNAMI_WRITEBACK_ENABLED = 'true';
  const req = { method:'POST', headers:{ authorization: auth() }, body:{ approvals:['privacy_sensitive','write_system_high_risk'], plan:[{ target:'crm.note', data:{ body:'Hei' } }] } };
  let status=200, json;
  const res = { status:(c)=>({ json:(o)=>{ status=c; json=o; } }), json:(o)=>{ json=o; } };
  await handler(req,res);
  expect(json.ok).toBe(true);
});
