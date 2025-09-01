const { verifyManifest, sha256sum } = require('../../integrations/signature');
test('unsigned manifest is invalid', ()=>{
  const buf = Buffer.from('adapter');
  const res = verifyManifest({}, buf);
  expect(res.ok).toBe(false);
});
