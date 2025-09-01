const connector = require('../../lib/connectors/zoom');
test('Zoom exposes name and sync()', ()=>{
  expect(connector.name).toBeTruthy();
  expect(typeof connector.sync).toBe('function');
});
