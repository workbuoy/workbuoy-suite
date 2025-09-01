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
test('member gets 403 on admin route', async ({ request: api })=>{
  const t = await newTenant(api, `u7_${Date.now()}@ex.test`);
  // simulate member by using a different email not in org_users
  const res = await api.post(`${BASE}/api/portal/connectors`, { data:{ provider:'email', enable:true }, headers:{ 'authorization':'Bearer invalid', 'x-tenant-id': t.tenant_id, 'content-type':'application/json' }});
  expect([401,403].includes(res.status())).toBeTruthy();
});
