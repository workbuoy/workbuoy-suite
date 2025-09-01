const { parseAndVerifySamlResponse } = require('../lib/auth/saml.js');
test('saml parser exists', ()=>{
  expect(typeof parseAndVerifySamlResponse).toBe('function');
});
