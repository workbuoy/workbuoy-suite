const login = require('../pages/api/auth/login.js').default;

test('login rejects missing credentials', done=>{
  const req = { method:'POST', body:{} };
  const res = { status: (c)=>({ json: (o)=>{ expect(c).toBe(400); done(); } }) };
  login(req,res);
});
