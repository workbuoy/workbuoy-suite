const connector = require('../../lib/connectors/jira_cloud');
test('Jira exposes name and sync()', ()=>{
  expect(connector.name).toBeTruthy();
  expect(typeof connector.sync).toBe('function');
});
