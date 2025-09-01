import { test, expect, request, APIRequestContext } from '@playwright/test';

const ORIGIN = process.env.E2E_BASE_ORIGIN || 'http://localhost:3000';
const BASE_DOMAIN = process.env.WB_BASE_DOMAIN || process.env.E2E_BASE_DOMAIN || 'example.com';

async function apiForTenant(tenant: string, base: string, request: APIRequestContext) {
  // In dev/CI we "mock" subdomain by targeting localhost and overriding the Host header.
  const headers = {
    Host: `${tenant}.${BASE_DOMAIN}`,
    'X-Forwarded-Proto': 'https',
  };
  return {
    post: (p: string, opts: any = {}) => request.post(`${base}${p}`, { ...opts, headers: { ...(opts.headers||{}), ...headers } }),
    get:  (p: string, opts: any = {}) => request.get(`${base}${p}`,  { ...opts, headers: { ...(opts.headers||{}), ...headers } }),
  };
}

test('Subdomain routing: t1.{domain} vs t2.{domain}', async ({ request }) => {
  const t1Api = await apiForTenant('t1', ORIGIN, request);
  const t2Api = await apiForTenant('t2', ORIGIN, request);

  // Create accounts for each tenant using their own subdomain/Host header
  async function magicFlow(email: string, api: any) {
    const req = await api.post(`/api/auth/magic/request`, { data: { email } });
    expect(req.ok()).toBeTruthy();
    const { magic_link } = await req.json();
    const u = new URL(magic_link);
    const token = u.searchParams.get('token')!;
    const resp = await api.post(`/api/auth/magic/consume`, { data: { token } });
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    return { jwt: body.token as string, tenant: body.tenant_id as string };
  }

  const t1 = await magicFlow('owner@t1.' + BASE_DOMAIN, t1Api);
  const t2 = await magicFlow('owner@t2.' + BASE_DOMAIN, t2Api);

  // Seed T1 secret via its subdomain
  const setT1 = await t1Api.post(`/api/portal/secrets`, {
    headers: { authorization: `Bearer ${t1.jwt}` },
    data: { name: 'demo', value: 'S1' }
  });
  expect(setT1.ok()).toBeTruthy();

  // T1 reads via t1.{domain} -> sees its data
  const r1 = await t1Api.get(`/api/portal/secrets`, {
    headers: { authorization: `Bearer ${t1.jwt}` }
  });
  expect(r1.ok()).toBeTruthy();
  const a1 = await r1.json();
  expect(a1.find((x: any) => x.name === 'demo')).toBeTruthy();

  // T2 reads via t2.{domain} -> must NOT see T1 data
  const r2 = await t2Api.get(`/api/portal/secrets`, {
    headers: { authorization: `Bearer ${t2.jwt}` }
  });
  expect(r2.ok()).toBeTruthy();
  const a2 = await r2.json();
  expect(a2.find((x: any) => x.name === 'demo')).toBeFalsy();
});