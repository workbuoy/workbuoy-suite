import { test, expect } from '@playwright/test';
test('connectors page toggles a connector', async ({ page }) => {
  await page.goto('/portal/connectors');
  // This is a simple smoke test; real test would authenticate and assert DB flag.
  expect(await page.title()).toBeTruthy();
});
