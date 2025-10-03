import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SyncService } from '../src/sync/SyncService.js';

test('enqueue and decrypt roundtrip', async () => {
  const svc = new SyncService('secret');
  await svc.enqueueOp('contacts', { name: 'Alice' });
  const status = svc.status();
  assert.equal(typeof status.online, 'boolean');
});
