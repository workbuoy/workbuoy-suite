import { test, expect } from '@playwright/test';

test('proactivity mode switcher enforces approval for high modes', async ({ page }) => {
  await page.goto('/');

  const modeSwitcher = page.getByTestId('proactivity-switcher');
  await expect(modeSwitcher).toBeVisible();
  await expect(page.getByRole('button', { name: 'Proaktiv' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText(/Mode: Assistive/i)).toBeVisible();

  await page.getByRole('button', { name: 'Kraken' }).click();
  const dialog = page.getByRole('dialog', { name: /Activate Kraken/i });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: /Cancel/i }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByText(/Mode: Assistive/i)).toBeVisible();

  await page.getByRole('button', { name: 'Kraken' }).click();
  const approval = page.getByRole('dialog', { name: /Activate Kraken/i });
  await approval.getByLabel(/Why are we escalating/i).fill('Pilot automation');
  await approval.getByRole('checkbox').check();
  await approval.getByRole('button', { name: /Approve mode change/i }).click();
  await expect(approval).toBeHidden();

  await expect(page.getByRole('button', { name: 'Kraken' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText(/Mode: Execution/i)).toBeVisible();
});
