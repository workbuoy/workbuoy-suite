const connector = require('../../lib/connectors/netsuite');
test('NetSuite exposes name and sync()', ()=>{
  expect(connector.name).toBeTruthy();
  expect(typeof connector.sync).toBe('function');
});
