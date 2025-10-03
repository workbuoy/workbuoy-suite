import { signToken } from '../../lib/auth.js';
import { resolveTenantId, sanitizeTenantId } from '../../lib/middleware/tenant.js';

describe('tenant resolution smoke suite', () => {
  afterEach(() => {
    process.env.WB_ALLOW_TENANT_HEADER = 'false';
  });

  it('sanitizes tenant identifiers consistently', () => {
    expect(sanitizeTenantId(' ACME_Inc.!! ')).toBe('acmeinc');
    expect(sanitizeTenantId('')).toBeNull();
  });

  it('prefers JWT tenant claims over other sources', () => {
    const token = signToken({ tenant_id: 'tenant-jwt-42' });
    const req: any = {
      headers: {
        authorization: `Bearer ${token}`,
        host: 'fallback.example.com',
        'x-tenant': 'header-tenant',
      },
      query: { tenant: 'query-tenant' },
    };
    expect(resolveTenantId(req)).toBe('tenant-jwt-42');
  });

  it('falls back to subdomain, then header when enabled, then query', () => {
    const reqWithSubdomain: any = {
      headers: { host: 'myteam.app.example.com' },
      query: {},
    };
    expect(resolveTenantId(reqWithSubdomain)).toBe('myteam');

    process.env.WB_ALLOW_TENANT_HEADER = 'true';
    const reqWithHeader: any = {
      headers: { 'x-tenant': 'Header-Tenant-99' },
      query: {},
    };
    expect(resolveTenantId(reqWithHeader)).toBe('header-tenant-99');

    const reqWithQuery: any = { headers: {}, query: { tenant: 'query_tenant' } };
    expect(resolveTenantId(reqWithQuery)).toBe('querytenant');
  });
});
