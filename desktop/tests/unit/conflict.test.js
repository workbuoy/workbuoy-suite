const { resolve } = require('../../conflict');
test('LWW resolves to newer record', ()=>{
  const local = { id:'1', updated_at: 2000, v: 'local' };
  const remote = { id:'1', updated_at: 1000, v: 'remote' };
  const r = resolve(local, remote);
  expect(r.value.v).toBe('local');
});
