
const { mask, isPII } = require('../lib/security/pii.js');
test('mask email partial', ()=>{
  expect(mask('user@example.com')).toMatch(/\*\*\*/);
});
test('isPII email', ()=>{
  expect(isPII('email')).toBe(true);
});
