const { make } = require('../../crdt/strategy-pilot');
test('crdt picks newer ts', ()=>{
  const s = make('nodeX');
  const local = { ts: 2, v:'A' }, remote = { ts:1, v:'B' };
  const r = s.resolve(local, remote);
  expect(r.value.v).toBe('A');
});
