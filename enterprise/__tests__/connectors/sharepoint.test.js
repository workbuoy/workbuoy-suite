const c = require('../../lib/connectors/sharepoint');
test('SharePoint connector shape', ()=>{ expect(c.name).toBeTruthy(); expect(typeof c.sync).toBe('function'); });
