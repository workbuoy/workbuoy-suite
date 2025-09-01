import { findSimilarRecords } from '../lib/data-quality/hygiene-engine.js';
test('findSimilarRecords returns scored matches', async ()=>{
  const deps = { db: { async findDedupeCandidates(){ return [
    { id:'1', name:'Jonas Example', email:'jonas@example.com', phone:'12345678' },
    { id:'2', name:'Jane Customer', email:'jane@else.com', phone:'99999999' },
  ]; }} };
  const out = await findSimilarRecords({ name:'Jona Exmple', email:'jonas@example.com', phone:'12345678' }, deps);
  expect(out[0].id).toBe('1');
  expect(out[0].score).toBeGreaterThanOrEqual(0.5);
});
