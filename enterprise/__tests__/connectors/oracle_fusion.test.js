const c = require('../../lib/connectors/oracle_fusion');
test('Oracle Fusion ERP connector shape', ()=>{ expect(c.name).toBeTruthy(); expect(typeof c.sync).toBe('function'); });
