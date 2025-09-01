const c = require('../../lib/connectors/adobe_experience');
test('Adobe Experience connector shape', ()=>{ expect(c.name).toBeTruthy(); expect(typeof c.sync).toBe('function'); });
