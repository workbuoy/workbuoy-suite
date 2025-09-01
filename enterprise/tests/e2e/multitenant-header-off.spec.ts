import { test, expect, request } from '@playwright/test';

// This test assumes WB_ALLOW_TENANT_HEADER=false (default).
// It verifies that X-Tenant-Id header does NOT override JWT/subdomain.
const BASE = process.env.E2E_BASE_URL || 'http://localhost:3000';

test('X-Tenant-Id ignored when WB_ALLOW_TENANT_HEADER=false', async ({ request: api }) => {
  // Create two tenants via magic-link flow
  async function magicFlow(email: string) {
    const req = await api.post(`${BASE}/api/auth/magic/request`, { data: { email } });
    expect(req.ok()).toBeTruthy();
    const { magic_link } = await req.json();
    const u = new URL(magic_link);
    const token = u.searchParams.get('token')!;
    const resp = await api.post(`${BASE}/api/auth/magic/consume`, { data: { token } });
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    return { jwt: body.token as string, tenant: body.tenant_id as string };
  }

  const t1 = await magicFlow('owner@t1.example.com');
  const t2 = await magicFlow('owner@t2.example.com');

  // Seed data in T1
  const setT1 = await api.post(`${BASE}/api/portal/secrets`, {
    headers: { authorization: `Bearer ${t1.jwt}` },
    data: { name: 'demo', value: 'S1' }
  });
  expect(setT1.ok()).toBeTruthy();

  // Ask with JWT=T1 but X-Tenant-Id=T2 -> should still return T1 data (header ignored)
  const r = await api.get(`${BASE}/api/portal/secrets`, {
    headers: { authorization: `Bearer ${t1.jwt}`, 'X-Tenant-Id': t2.tenant }
  });
  expect(r.ok()).toBeTruthy();
  const arr = await r.json();
  expect(Array.isArray(arr)).toBeTruthy();
  expect(arr.find((x: any) => x.name === 'demo')).toBeTruthy();
});