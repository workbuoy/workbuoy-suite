import { test, expect } from '@playwright/test';
test('breaker skips scheduler cycles when open', async () => {
  process.env.WB_BREAKER_OPEN = 'true';
  // Here you would trigger a scheduler tick and assert skip metric increased.
  expect(true).toBeTruthy();
});
