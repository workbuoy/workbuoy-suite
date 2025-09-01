const connector = require('../../lib/connectors/google_drive');
test('Google Drive exposes name and sync()', ()=>{
  expect(connector.name).toBeTruthy();
  expect(typeof connector.sync).toBe('function');
});
