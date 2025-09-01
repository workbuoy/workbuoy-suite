const connector = require('../../lib/connectors/qlik_sense');
test('Qlik Sense exposes name and sync()', ()=>{
  expect(connector.name).toBeTruthy();
  expect(typeof connector.sync).toBe('function');
});
