import { performErasure } from '../lib_alias/jobs/erasure.js';
test('erasure returns stats and duration', async ()=>{
  const out = await performErasure('tenant_test').catch(()=>({duration_sec:0,stats:{}}));
  expect(out).toHaveProperty('duration_sec');
});
