import { auditLog, verifyAuditChain } from '../lib/audit.js';

test('audit WORM chain verifies after a few events', async () => {
  await auditLog({ type: 'test_start', ts: Date.now() });
  await auditLog({ type: 'test_mid', ts: Date.now() });
  await auditLog({ type: 'test_end', ts: Date.now() });
  const res = await verifyAuditChain();
  expect(res.ok).toBe(true);
  expect(res.count).toBeGreaterThanOrEqual(3);
});
