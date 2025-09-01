import { test, expect } from '@playwright/test';

test('HUD labels appear', async ({ page }) => {
  await page.goto('about:blank');
  await page.addScriptTag({ path: 'public/js/hud-labels.js' });
  const label = await page.evaluate(()=>window.WB_HUD_LABELS.visit);
  expect(label).toBe('Latest updates');
});
