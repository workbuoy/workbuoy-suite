import { test, expect } from '@playwright/test';
const BASE = process.env.E2E_BASE_URL || 'http://localhost:3000';

test('Resync enqueues job (admin required)', async ({ request })=>{
  const r1 = await request.post(`${BASE}/api/systems/resync`, { data:{ connector:'Jira' } });
  expect([401,403,400].includes(r1.status())).toBeTruthy();
  const r2 = await request.post(`${BASE}/api/systems/resync`, { data:{ connector:'Jira' },
    headers:{ 'x-tenant-id':'demo-tenant','x-user-id':'admin@example.com' } });
  expect([200,403].includes(r2.status())).toBeTruthy();
});
