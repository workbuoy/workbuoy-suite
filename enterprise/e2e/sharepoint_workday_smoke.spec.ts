import { test, expect } from '@playwright/test';
test('sharepoint connector listed', async ({ request }) => {
  const res = await request.get('/api/connectors');
  expect(res.status()).toBe(200);
  const json = await res.json();
  const names = json.connectors.map((x:any)=>x.name);
  expect(names).toContain('SharePoint');
});
test('workday connector listed', async ({ request }) => {
  const res = await request.get('/api/connectors');
  const json = await res.json();
  const names = json.connectors.map((x:any)=>x.name);
  expect(names).toContain('Workday');
});
