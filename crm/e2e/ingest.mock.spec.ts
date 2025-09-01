import { test, expect } from '@playwright/test';
test('ingest mock creates new contact/deal visible in portal', async ({ page }) => {
  const res = await page.request.post('/api/ingest/run');
  expect(res.ok()).toBeTruthy();
  await page.goto('/portal/crm/companies');
  // Expect to see at least one of mocked companies
  await expect(page.getByRole('link', { name: /Navy Computing|Kernel Co|Acme Inc/ })).toBeVisible();
  await page.goto('/portal/crm/deals');
  await expect(page.getByText(/Onboarding Package|Q4 Pilot/)).toBeVisible();
});
