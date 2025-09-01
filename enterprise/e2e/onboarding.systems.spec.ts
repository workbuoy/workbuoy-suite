// @ts-check
import { test, expect } from '@playwright/test';

test('Onboarding systems select shows categories and Koble til alle', async ({ page }) => {
  await page.goto('/portal/onboarding/systems');
  await expect(page.getByText('Velg systemer')).toBeVisible();
  await expect(page.getByText('Koble til alle')).toBeVisible();
});
