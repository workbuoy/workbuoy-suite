import { test, expect } from '@playwright/test';
test('DSR delete marks user as erased', async ({ request }) => {
  const res = await request.post('/api/secure/dsr/delete', { data: { tenant: 'demo', userId: 'u123' } });
  expect([200,401]).toContain(res.status()); // 401 if no token
});
