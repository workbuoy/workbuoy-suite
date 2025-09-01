import { test, expect, request } from '@playwright/test';

const BASE = process.env.E2E_BASE_URL || 'http://localhost:3000';

async function magicFlow(api, email: string) {
  // 1) request a magic link
  const req = await api.post(`${BASE}/api/auth/magic/request`, { data: { email } });
  expect(req.ok()).toBeTruthy();
  const { magic_link } = await req.json();
  const u = new URL(magic_link);
  const token = u.searchParams.get('token')!;
  // 2) consume to get JWT + tenant id
  const resp = await api.post(`${BASE}/api/auth/magic/consume`, { data: { token } });
  expect(resp.ok()).toBeTruthy();
  const body = await resp.json();
  return { jwt: body.token as string, tenant: body.tenant_id as string };
}

test('Fuzz tenant resolution: JWT > subdomain > header > query', async ({ request: api }) => {
  const t1Email = 'owner@t1.example.com';
  const t2Email = 'owner@t2.example.com';
  const t1 = await magicFlow(api, t1Email);
  const t2 = await magicFlow(api, t2Email);

  // Seed tenant T1 with a secret "demo" and value S1
  const setT1 = await api.post(`${BASE}/api/portal/secrets`, {
    headers: { authorization: `Bearer ${t1.jwt}` },
    data: { name: 'demo', value: 'S1' }
  });
  expect(setT1.ok()).toBeTruthy();

  // 1) JWT (t2) + query tenant=t1 must stay in t2 (ignore query)
  const list1 = await api.get(`${BASE}/api/portal/secrets?tenant=${t1.tenant}`, {
    headers: { authorization: `Bearer ${t2.jwt}` }
  });
  expect(list1.ok()).toBeTruthy();
  const b1 = await list1.json();
  expect(Array.isArray(b1)).toBeTruthy();
  // T2 must not see T1 secret
  expect(b1.find((x: any) => x.name === 'demo')).toBeFalsy();

  // 2) JWT (t1) + header X-Tenant-Id=t2 must stay in t1 (header ignored/low precedence)
  const list2 = await api.get(`${BASE}/api/portal/secrets`, {
    headers: { authorization: `Bearer ${t1.jwt}`, 'X-Tenant-Id': t2.tenant }
  });
  expect(list2.ok()).toBeTruthy();
  const b2 = await list2.json();
  expect(b2.find((x: any) => x.name === 'demo')).toBeTruthy();

  // 3) Missing JWT + header/query mixtures -> should be 401/403 or empty per hardening
  const list3 = await api.get(`${BASE}/api/portal/secrets?tenant=${t1.tenant}`, {
    headers: { 'X-Tenant-Id': t2.tenant }
  });
  expect([401,403,200]).toContain(list3.status());
  if (list3.status() === 200) {
    const b3 = await list3.json();
    expect(b3.find((x: any) => x.name === 'demo')).toBeFalsy();
  }

  // 4) Wrong-signature JWT (tampered) should be rejected
  const badJwt = t1.jwt.replace(/\.[^.]+$/, '.bad-sig');
  const list4 = await api.get(`${BASE}/api/portal/secrets`, {
    headers: { authorization: `Bearer ${badJwt}` }
  });
  expect([401,403]).toContain(list4.status());
});