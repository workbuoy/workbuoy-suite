const roles = require('../pages/api/roles/index.js').default;

test('roles api rejects unauthorized', done=>{
  const req = { method:'GET', headers:{} };
  const res = { status: (c)=>({ json: (o)=>{ expect(c).toBe(401); done(); } }) };
  roles(req,res);
});
