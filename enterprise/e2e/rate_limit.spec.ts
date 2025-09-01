import { test, expect } from '@playwright/test';
test('rate limiter returns 429 after bursts', async ({ request }) => {
  let status429 = false;
  for (let i=0;i<500;i++){
    const res = await request.get('/api/health/ready', { headers: { 'x-tenant-id': 'e2e' } });
    if (res.status() === 429) { status429 = true; break; }
  }
  expect(status429).toBeTruthy();
});
