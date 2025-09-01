// Playwright skeleton for rate-limit; adapt baseURL via test config
import { test, expect } from '@playwright/test';

test('billing checkout is rate-limited', async ({ request }) => {
  const first = await request.post('/api/billing/create-checkout-session', { data: { plan: 'pro' }, headers: { cookie: 'auth=1' } });
  expect([200, 429]).toContain(first.status());
  let saw429 = false;
  for (let i=0;i<100;i++){
    const r = await request.post('/api/billing/create-checkout-session', { data: { plan: 'pro' }, headers: { cookie: 'auth=1' } });
    if (r.status() === 429){ saw429 = true; break; }
  }
  expect(saw429).toBeTruthy();
});
