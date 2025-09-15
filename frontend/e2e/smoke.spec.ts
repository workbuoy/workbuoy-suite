import { test, expect } from '@playwright/test';

test('loads app, flips to Navi, opens CRM, adds contact', async ({ page }) => {
  await page.goto('/');

  // Wait for FlipCard to render (Buoy header visible)
  await expect(page.getByText('Buoy')).toBeVisible();

  // Flip to Navi
  await page.getByRole('button', { name: /flip/i }).click();

  // Navi header visible
  await expect(page.getByText('Navi')).toBeVisible();

  // Click CRM tile (Kontakter)
  // Match by text to be robust (icon/emoji may vary)
  await page.getByRole('button', { name: /Kontakter/i }).first().click().catch(async () => {
    // Fallback: click text node if tile isn't a button
    await page.getByText('Kontakter').first().click();
  });

  // Panel opens
  await expect(page.getByRole('region', { name: /Kontakter/i })).toBeVisible();

  // Add a contact
  await page.getByPlaceholder('Navn').fill('Test Person');
  // E-post optional; skip
  await page.getByRole('button', { name: /Legg til kontakt/i }).click();

  // Expect to see "Test Person" in the list
  await expect(page.getByText(/Test Person/i)).toBeVisible();
});