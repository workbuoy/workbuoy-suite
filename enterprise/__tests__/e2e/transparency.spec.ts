import { test, expect } from '@playwright/test';

test('transparency banner shows mode & signals', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('#wb-transparency', { timeout: 10000 });
  const txt = await page.textContent('#wb-transparency');
  expect(txt).toContain('Mode:');
  expect(txt).toContain('Signals');
});