const pactum = require('pactum');
test('contract smoke (mock server)', async ()=>{
  const base = process.env.MOCK_BASE || 'http://localhost:4010';
  await pactum.spec().get('/v1/systems/status').expectStatus([200,404]);
});
