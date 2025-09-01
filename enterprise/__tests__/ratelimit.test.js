
const { allow } = require('../lib/http/ratelimit.js');
test('ratelimit allows then throttles', ()=>{
  let ok=0; for(let i=0;i<5;i++){ if(allow({ tenant_id:'t', rpm:1, burst:2 }).allowed) ok++; }
  expect(ok).toBeLessThan(5);
});
