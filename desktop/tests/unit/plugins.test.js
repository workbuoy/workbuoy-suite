const { registry, list } = require('../../integrations');
const Store = require('electron-store');
test('registry contains built-in adapters', ()=>{
  const s = new Store();
  const items = list(s);
  expect(items.find(p=>p.key==='google-calendar')).toBeTruthy();
});
