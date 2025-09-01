const { withIncrementalSync } = require('../lib/connectors/base.js');

test('withIncrementalSync aggregates pages', async ()=>{
  const pages = [
    { items:[1,2], hasMore:true, nextCursor:'2', nextSince:'s1' },
    { items:[3], hasMore:false, nextCursor:'3', nextSince:'s2' },
  ];
  const pushed = [];
  const res = await withIncrementalSync({
    tenant:'t', name:'X', fetchPage: async ()=> pages.shift(),
    pushItems: async (it)=> pushed.push(...it),
    getState: async ()=> null, setState: async ()=>{}
  });
  expect(res.total).toBe(3);
  expect(pushed).toEqual([1,2,3]);
});
