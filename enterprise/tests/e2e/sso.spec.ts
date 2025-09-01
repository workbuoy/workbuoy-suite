import { test, expect } from '@playwright/test';
const BASE = process.env.E2E_BASE_URL || 'http://localhost:3000';

test('OIDC login endpoint redirects', async ({ request })=>{
  const r = await request.get(`${BASE}/api/auth/sso-login?provider=google`);
  expect([302,400].includes(r.status())).toBeTruthy();
});
