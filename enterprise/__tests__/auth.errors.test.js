const ping = require('../pages/api/secure/ping.js').default;

test('secure ping requires auth', done=>{
  const req = { headers:{}, method:'GET' };
  const res = {
    status: (c)=>({ json: (o)=>{ expect(c).toBe(401); done(); } })
  };
  ping(req,res);
});
