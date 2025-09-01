/* @jest-environment node */
import { resolveTenantId, sanitizeTenantId } from '../../lib/middleware/tenant.js';

function mkReq({host, authTenant, headerTenant, queryTenant, allowHeader}){
  const token = authTenant ? Buffer.from(JSON.stringify({tenant_id: authTenant})).toString('base64') : null;
  const headers = {};
  if (host) headers['host'] = host;
  if (headerTenant) headers['x-tenant'] = headerTenant;
  if (token) headers['authorization'] = `Bearer ${token}.sig`;
  const req = { headers, query: {}, _allowHeader: allowHeader };
  if (queryTenant) req.query.tenant = queryTenant;
  return req;
}

// monkey patch ALLOW_HEADER by env var
process.env.WB_ALLOW_TENANT_HEADER = 'false';
process.env.WB_BASE_DOMAIN = 'app.example.com'; // base domain for tests

test('sanitize allows a-z 0-9 hyphen and max 64', () => {
  const s = sanitizeTenantId('ACME_Inc.!!!!-North-€€€');
  expect(s).toBe('acmeinc-north-');
  expect(s.length).toBeLessThanOrEqual(64);
});

test('JWT has highest precedence over header and query', () => {
  const req = mkReq({authTenant:'t1', headerTenant:'t2', queryTenant:'t3'});
  expect(resolveTenantId(req)).toBe('t1');
});

test('Subdomain is used when no JWT', () => {
  const req = mkReq({host:'t2.app.example.com'});
  expect(resolveTenantId(req)).toBe('t2');
});

test('Header ignored when WB_ALLOW_TENANT_HEADER=false', () => {
  const req = mkReq({headerTenant:'tH'});
  expect(resolveTenantId(req)).toBe(null);
});

test('Header used when WB_ALLOW_TENANT_HEADER=true', () => {
  process.env.WB_ALLOW_TENANT_HEADER = 'true';
  const req = mkReq({headerTenant:'X-tenant--0099'});
  expect(resolveTenantId(req)).toBe('x-tenant--0099'.slice(0,64));
  process.env.WB_ALLOW_TENANT_HEADER = 'false';
});

test('Query used as last resort', () => {
  const req = mkReq({queryTenant:'q9'});
  expect(resolveTenantId(req)).toBe('q9');
});
