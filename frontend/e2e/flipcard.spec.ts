import { test, expect } from '@playwright/test';

test('flipcard flips, resizes, and connects entities', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('Buoy')).toBeVisible();

  // Use the connect affordance to link the default selection
  await page.getByRole('button', { name: /Connect/i }).first().click();

  const card = page.locator('[data-testid="flip-card"] .flip-card');
  const initialClass = await card.getAttribute('class');

  const resizeButton = page.getByRole('button', { name: /Resize card/ });
  await resizeButton.press('ArrowRight');
  await expect(card).not.toHaveAttribute('class', initialClass || '');

  await page.getByRole('button', { name: /Show Navi/i }).click();
  await expect(page.getByText('Navi')).toBeVisible();

  await expect(page.getByText(/Acme Expansion/i)).toBeVisible();
});
