import { test, expect } from '@playwright/test';
const BASE = process.env.E2E_BASE_URL || 'http://localhost:3000';

test('SCIM filtering & pagination', async ({ request })=>{
  const c = await request.post(`${BASE}/api/scim/v2/Users`, { data:{ userName:'alice', name:{givenName:'Alice', familyName:'A'} } });
  expect([200,201].includes(c.status())).toBeTruthy();
  const g = await request.get(`${BASE}/api/scim/v2/Users?filter=userName%20eq%20%22alice%22&startIndex=1&count=1`);
  expect(g.ok()).toBeTruthy();
  const j = await g.json(); expect(j.itemsPerPage).toBe(1);
});
