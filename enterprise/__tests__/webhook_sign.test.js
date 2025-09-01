
const { sign } = require('../lib/webhooks/signer.js');
test('signature format', ()=>{
  const s = sign('sec','{}');
  expect(s).toMatch(/t=\d+, v1=[0-9a-f]+/);
});
