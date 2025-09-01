import { test, expect } from '@playwright/test';
test('flex payment button and redirect screenshot', async ({ page })=>{
  await page.route('**/api/billing/create-payment', async route=>{
    await route.fulfill({ status:200, body: JSON.stringify({ url:'https://checkout.test/pay' }) });
  });
  await page.goto('/pricing.html');
  await page.getByRole('button', { name: 'Try First Task Free' }).click();
  await page.screenshot({ path: 'docs/screenshots/flex_pay_click.png', fullPage: true });
});