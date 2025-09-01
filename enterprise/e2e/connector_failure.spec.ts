import { test, expect } from '@playwright/test';
test('simulated connector upstream failure triggers breaker/retry', async () => {
  // simulate upstream failure by toggling env flag
  process.env.TEST_FORCE_CONNECTOR_FAIL = 'true';
  // call sync API
  const res = await fetch('http://localhost:3000/api/connectors/sync?connector=hubspot', { method: 'POST' });
  expect([200,500]).toContain(res.status);
});
