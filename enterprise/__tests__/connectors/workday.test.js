const c = require('../../lib/connectors/workday');
test('Workday connector shape', ()=>{ expect(c.name).toBeTruthy(); expect(typeof c.sync).toBe('function'); });
