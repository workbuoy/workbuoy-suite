import { test, expect } from '@playwright/test';
const BASE = process.env.E2E_BASE_URL || 'http://localhost:3000';
test('Enable demo dataset', async ({ request })=>{
  const r = await request.post(`${BASE}/api/portal/onboarding/demo-data?enable=1`, { headers:{ 'x-tenant-id':'tenant-z' } });
  expect(r.ok()).toBeTruthy();
  const g = await request.get(`${BASE}/api/portal/onboarding/demo-data`, { headers:{ 'x-tenant-id':'tenant-z' } });
  const j = await g.json(); expect(j?.data?.contacts?.length).toBeGreaterThan(0);
});
