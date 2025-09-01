import { test, expect } from '@playwright/test';
test('metrics endpoint exposes counters', async ({ page }) => {
  const res = await page.goto('/api/metrics');
  const text = await page.content();
  expect(text).toContain('wb_crm_ai_summaries_total');
  expect(text).toContain('wb_crm_entities_total');
});
