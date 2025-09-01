import { test, expect } from '@playwright/test';
test('rejects missing/invalid token', async ({ request }) => {
  const res = await request.post('/api/connectors/test-secret', { data: { connector: 'hubspot', secretRef: 'ref1' } });
  expect(res.status()).toBe(401);
});
