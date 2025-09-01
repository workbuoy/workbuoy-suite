import { test, expect } from '@playwright/test';
const BASE = process.env.E2E_BASE_URL || 'http://localhost:3000';
test('Admin-consent links exist', async ({ request, page })=>{
  const ms = await request.get(`${BASE}/api/integrations/admin-consent-link?provider=microsoft-graph`);
  expect(ms.ok()).toBeTruthy();
  const g = await request.get(`${BASE}/api/integrations/admin-consent-link?provider=google-workspace`);
  expect(g.ok()).toBeTruthy();
  await page.goto(`${BASE}/portal/onboarding/admin-consent`);
  await expect(page.getByText('IT-godkjenning')).toBeVisible();
});
