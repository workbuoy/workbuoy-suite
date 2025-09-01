import { createSnapshot, listSnapshots } from '../../lib/meta/rollback.js';

test('snapshot can be created and listed', async ()=>{
  const r = await createSnapshot('jest');
  expect(r.ok).toBe(true);
  const list = listSnapshots();
  expect(Array.isArray(list)).toBe(true);
});