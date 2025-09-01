
import { test, expect, request } from '@playwright/test';

const BASE = process.env.E2E_BASE_URL || 'http://localhost:3000';

async function magicFlow(api, email: string) {
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

test('Owner invites admin, admin can access admin panel; member limited', async ({ request: api }) => {
  const owner = await magicFlow(api, 'owner@t1.example.com');

  // Owner sends invite for admin
  const inv = await api.post(`${BASE}/api/org/invite`, {
    headers: { authorization: `Bearer ${owner.jwt}` },
    data: { email: 'admin@t1.example.com', role: 'admin' }
  });
  expect(inv.ok()).toBeTruthy();
  const { invite_token } = await inv.json();

  // Accept invite to get JWT for admin
  const acc = await api.post(`${BASE}/api/org/invite-accept`, { data: { token: invite_token } });
  expect(acc.ok()).toBeTruthy();
  const accBody = await acc.json();
  const adminJwt = accBody.token as string;

  // Admin can hit admin users endpoint
  const list = await api.get(`${BASE}/api/portal/users`, { headers: { authorization: `Bearer ${adminJwt}` } });
  expect(list.ok()).toBeTruthy();

  // Create a member and assert access denied to admin users endpoint
  const inv2 = await api.post(`${BASE}/api/org/invite`, {
    headers: { authorization: `Bearer ${owner.jwt}` },
    data: { email: 'member@t1.example.com', role: 'member' }
  });
  expect(inv2.ok()).toBeTruthy();
  const token2 = (await inv2.json()).invite_token;
  const acc2 = await api.post(`${BASE}/api/org/invite-accept`, { data: { token: token2 } });
  expect(acc2.ok()).toBeTruthy();
  const memberJwt = (await acc2.json()).token as string;

  const forbidden = await api.post(`${BASE}/api/portal/users`, {
    headers: { authorization: `Bearer ${memberJwt}` },
    data: { email: 'someone@t1.example.com', role: 'admin' }
  });
  expect(forbidden.status()).toBe(403);
});
