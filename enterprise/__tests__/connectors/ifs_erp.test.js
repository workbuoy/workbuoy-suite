const c = require('../../lib/connectors/ifs_erp');
test('IFS ERP connector shape', ()=>{ expect(c.name).toBeTruthy(); expect(typeof c.sync).toBe('function'); });
