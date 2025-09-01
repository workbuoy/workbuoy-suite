
import { test, expect } from '@playwright/test';
const BASE = process.env.E2E_BASE_URL || 'http://localhost:3000';
test('SCIM Users create/list', async ({ request })=>{
  const c = await request.post(`${BASE}/api/scim/v2/Users`, { data:{ userName:'alice', name:{givenName:'Alice',familyName:'A'} } });
  expect([200,201].includes(c.status())).toBeTruthy();
  const g = await request.get(`${BASE}/api/scim/v2/Users`);
  expect(g.ok()).toBeTruthy();
});
