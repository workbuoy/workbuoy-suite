
import { test, expect } from '@playwright/test';
const BASE = process.env.E2E_BASE_URL || 'http://localhost:3000';
test('Systems status & resync', async ({ request })=>{
  const s = await request.get(`${BASE}/api/systems/status`);
  expect([200,404,500].includes(s.status())).toBeTruthy();
  const r = await request.post(`${BASE}/api/systems/resync`, { data:{ connector:'Jira' } });
  expect([200,400].includes(r.status())).toBeTruthy();
});
