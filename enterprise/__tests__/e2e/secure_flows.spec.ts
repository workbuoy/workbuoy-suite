import { test, expect } from '@playwright/test';
test('gdpr export & soc2 verify endpoints', async ({ request })=>{
  const v = await request.get('/api/secure/gdpr?action=soc2_verify');
  expect([200,401,403]).toContain(v.status());
  const g = await request.get('/api/secure/gdpr?action=gdpr_export&email=test@example.com');
  expect([200,401,403]).toContain(g.status());
});
