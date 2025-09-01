const c = require('../../lib/connectors/servicenow');
test('ServiceNow connector shape', ()=>{ expect(c.name).toBeTruthy(); expect(typeof c.sync).toBe('function'); });
