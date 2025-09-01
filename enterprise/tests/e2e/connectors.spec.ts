import { test, expect } from '@playwright/test';
const BASE = process.env.E2E_BASE_URL || 'http://localhost:3000';

async function magicFlow(api, email: string) {
  const req = await api.post(`${BASE}/api/auth/magic/request`, { data: { email } });
  const { magic_link } = await req.json(); const token = new URL(magic_link).searchParams.get('token')!;
  const resp = await api.post(`${BASE}/api/auth/magic/consume`, { data: { token } });
  const body = await resp.json(); return { jwt: body.token as string, tenant: body.tenant_id as string };
}

test('Demo-mode then activate connector -> sync -> status OK', async ({ page, request: api }) => {
  const owner = await magicFlow(api, 'owner@t5.example.com');
  // Demo-mode: no connectors -> dashboard shows demo notice
  await page.addInitScript((jwt)=> localStorage.setItem('wb_jwt', `Bearer ${jwt}`), owner.jwt);
  await page.goto(`${BASE}/portal/dashboard`);
  await expect(page.locator('text=Demo-data')).toBeVisible();

  // Enable connector via API
  const en = await api.post(`${BASE}/api/portal/connectors`, {
    headers: { authorization: `Bearer ${owner.jwt}` },
    data: { provider: 'email', action: 'enable', secrets: { api_key: 'xyz' } }
  });
  expect(en.ok()).toBeTruthy();

  // Trigger sync and verify status
  const syn = await api.post(`${BASE}/api/portal/connectors/sync`, {
    headers: { authorization: `Bearer ${owner.jwt}` },
    data: { provider: 'email' }
  });
  expect(syn.ok()).toBeTruthy();

  // Reload connectors page and expect status connected (● green via text 'Status: connected')
  await page.goto(`${BASE}/portal/connectors`);
  await expect(page.locator('text=Status: connected')).toBeVisible();
});
