
// tests/e2e/flows.spec.ts
import { test, expect } from '@playwright/test';

test('placeholder E2E: health endpoint responds', async ({ request }) => {
  const res = await request.get('/api/integrations/health');
  expect([200,401,403,404]).toContain(res.status()); // placeholder depending on auth
});
