import { test, expect } from '@playwright/test';
test('register flow screenshot', async ({ page })=>{
  await page.goto('/register.html');
  await expect(page.getByText('Choose your WorkBuoy experience')).toBeVisible();
  await page.screenshot({ path: 'docs/screenshots/register_step1.png', fullPage: true });
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByText('Your primary role')).toBeVisible();
  await page.screenshot({ path: 'docs/screenshots/register_step2.png', fullPage: true });
});

test('pricing core checkout button present', async ({ page })=>{
  await page.goto('/pricing.html');
  await expect(page.getByRole('button', { name: 'Start Free Trial' }).first()).toBeVisible();
  await page.screenshot({ path: 'docs/screenshots/pricing_core.png', fullPage: true });
});