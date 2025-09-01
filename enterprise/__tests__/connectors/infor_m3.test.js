const connector = require('../../lib/connectors/infor_m3');
test('Infor M3 exposes name and sync()', ()=>{
  expect(connector.name).toBeTruthy();
  expect(typeof connector.sync).toBe('function');
});
