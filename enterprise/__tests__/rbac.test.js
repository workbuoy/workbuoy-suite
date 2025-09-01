
const { getRole } = require('../lib/auth/rbac.js');
test('getRole returns null for unknown', async ()=>{
  const r = await getRole('t','u');
  expect([null, undefined].includes(r)).toBeTruthy();
});
