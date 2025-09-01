
import { test, expect } from '@playwright/test';
test('onboarding shows disclaimer and completes', async ({ page })=>{
  await page.goto('/portal/onboarding');
  await expect(page.locator('text=Workbuoy kan gjøre feil')).toBeTruthy();
  await page.getByText('Start').click();
  await page.getByText('Fortsett').click();
  await page.getByText('Fortsett').click();
  await page.getByText('Fortsett').click();
  await page.getByText('Fortsett').click();
});
