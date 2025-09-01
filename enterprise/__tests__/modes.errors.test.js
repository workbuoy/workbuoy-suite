const handler = require('../pages/api/modes/handle.js').default;

test('modes api rejects bad mode', done=>{
  const req = { method:'POST', headers:{}, body:{ mode:'Hyper', input:'x', context:{} } };
  const res = { status:(c)=>({ json:(o)=>{ expect(c).toBe(400); done(); } }) };
  handler(req,res);
});
