
const { createApiKey } = require('../lib/auth/api-keys.js');
test('createApiKey returns secret once', async ()=>{
  const out = await createApiKey({ tenant_id:'t', name:'Test' });
  expect(out.secret).toMatch(/^wb_/);
});
