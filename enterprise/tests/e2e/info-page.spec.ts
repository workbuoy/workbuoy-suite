
import { test, expect } from '@playwright/test';
test('info page renders and banner present', async ({ page })=>{
  await page.goto('/portal/info');
  await expect(page.locator('text=Viktig informasjon')).toBeTruthy();
  await expect(page.locator('text=Workbuoy kan gjøre feil')).toBeTruthy();
});
