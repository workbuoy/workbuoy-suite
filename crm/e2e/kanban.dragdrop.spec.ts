import { test, expect } from '@playwright/test';

test('drag and drop deal from Lead to Won', async ({ page }) => {
  // Create a deal via API
  const name = 'DD Deal ' + Date.now();
  const create = await page.request.post('/api/deals', { data: { name, stage: 'Lead' } });
  const deal = await create.json();
  await page.goto('/portal/crm/deals');
  const card = page.locator(`[data-testid="deal-Lead-${deal.id}"]`);
  await expect(card).toBeVisible();
  // Drag to Won column using built-in dragAndDrop
  const wonColumn = page.locator('text=Won').first();
  await card.dragTo(wonColumn);
  // Reload and verify not in Lead
  await page.reload();
  await expect(page.locator(`[data-testid="deal-Lead-${deal.id}"]`)).toHaveCount(0);
});
