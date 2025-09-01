// Pseudo e2e — validates presence of purchase flow endpoints
import { test, expect } from '@playwright/test';
test('stripe session endpoint exists', async ({ request })=>{
  const res = await request.get('/api/stripe/session');
  expect([200,401,403,405]).toContain(res.status());
});
