/* @jest-environment node */
import { signToken } from '../../lib/auth.js';

test('OIDC callback validates iss/aud and creates tenant for first user', async () => {
  process.env.WB_SSO_ENABLED = 'true';
  process.env.OIDC_ISSUER_URL = 'https://accounts.google.com';
  process.env.OIDC_CLIENT_ID = 'client123';
  const base = 'http://localhost:8080';
  // Build fake id_token claims (no signature validation in tests)
  const payload = Buffer.from(JSON.stringify({ iss: process.env.OIDC_ISSUER_URL, aud: process.env.OIDC_CLIENT_ID, email: 'sso.user@example.com' })).toString('base64url');
  const idToken = `${payload}.sig`;
  // Simulate hitting the endpoint module directly
  const mod = await import('../../pages/api/auth/oidc/callback.js');
  const req = { method:'GET', query: { id_token: idToken }, headers: { origin: base } };
  let status = 0, json = null;
  const res = { status:(s)=>{status=s; return res;}, json:(b)=>{ json=b; } };
  await mod.default(req,res);
  expect(status).toBe(200);
  expect(json.token).toBeTruthy();
  expect(json.tenant_id).toBeTruthy();
});
