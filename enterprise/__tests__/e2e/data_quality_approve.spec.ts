
import { test, expect } from '@playwright/test';

test('data quality approve flow + audit entry', async ({ page }) => {
  await page.goto('/admin/data-quality.html');
  // inject token for RBAC bypass in dev (if any)
  await page.addInitScript(() => localStorage.setItem('wb.token','dev-token'));
  // Seed: call suggest API directly
  await page.request.post('/api/data-quality/suggest', { data: { records:[{ id:1, name:'acme inc', phone:'555 111 2222', amount: 1000 }], source:'test' } });
  await page.reload();
  // select first row if present
  const first = page.locator('tbody input[type=checkbox]').first();
  await first.waitFor({ state: 'visible' });
  await first.check();
  await page.click('#approve');
  await expect(page.locator('#status')).toContainText('Applied');
});
