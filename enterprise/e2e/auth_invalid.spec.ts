import { test, expect } from '@playwright/test';
test('OIDC invalid token rejected', async ({ request }) => {
  const res = await request.get('/api/health/ready', { headers: { Authorization: 'Bearer invalid' } });
  expect(res.status()).toBe(401);
});
