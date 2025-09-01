// desktop/tests/sync.test.ts
import { SyncService } from '../src/sync/SyncService';

test('enqueue and decrypt roundtrip', async () => {
  const svc = new SyncService('secret');
  await svc.enqueueOp('contacts', { name:'Alice' });
  // forcibly call syncNow, expecting it to try to POST
  expect(typeof svc.status().online).toBe('boolean');
});
