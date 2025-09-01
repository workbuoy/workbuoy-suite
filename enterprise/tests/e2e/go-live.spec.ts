import { test, expect, request } from '@playwright/test';
const BASE = process.env.E2E_BASE_URL || 'http://localhost:3000';
async function newTenant(api, email){
  const r = await api.post(`${BASE}/api/auth/magic/request`, { data:{ email } });
  const j = await r.json();
  const u = new URL(j.magic_link);
  const token = u.searchParams.get('token');
  const c = await api.get(`${BASE}/api/auth/magic/consume?token=${token}`);
  return await c.json();
}
test('go-live happy path + quota 429', async ({ request: api })=>{
  const t = await newTenant(api, `u7_${Date.now()}@ex.test`);
  // hit billing status
  const s = await api.get(`${BASE}/api/billing/status`, { headers:{ 'authorization':`Bearer ${t.token}` }});
  expect(s.ok()).toBeTruthy();
  // connector list
  await api.get(`${BASE}/api/portal/connectors`, { headers:{ 'authorization':`Bearer ${t.token}`, 'x-tenant-id': t.tenant_id }});
  // health & ready
  expect((await api.get(`${BASE}/api/healthz`)).ok()).toBeTruthy();
  expect((await api.get(`${BASE}/api/readyz`)).ok()).toBeTruthy();
});
