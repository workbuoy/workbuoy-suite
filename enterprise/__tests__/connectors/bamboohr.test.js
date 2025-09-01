const connector = require('../../lib/connectors/bamboohr');
test('BambooHR exposes name and sync()', ()=>{
  expect(connector.name).toBeTruthy();
  expect(typeof connector.sync).toBe('function');
});
