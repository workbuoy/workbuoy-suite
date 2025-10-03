import { jest } from '@jest/globals';

process.env.NODE_ENV = process.env.NODE_ENV ?? 'test';
process.env.PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = process.env.PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD ?? '1';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'devsecret';
process.env.WB_ALLOW_TENANT_HEADER = process.env.WB_ALLOW_TENANT_HEADER ?? 'false';
process.env.WB_BASE_DOMAIN = process.env.WB_BASE_DOMAIN ?? 'app.example.com';

jest.setTimeout(30_000);
