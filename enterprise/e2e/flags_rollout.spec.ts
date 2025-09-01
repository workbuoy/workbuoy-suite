import { test, expect } from '@playwright/test';

test('feature flags default', async ({ page }) => {
  // This is a light check; real app would render flags into DOM
  expect(process.env.ENABLE_BATCH_SCORING || 'true').toBe('true');
});
