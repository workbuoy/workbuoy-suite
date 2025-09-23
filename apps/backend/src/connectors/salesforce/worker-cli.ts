import { runOnce } from './worker.js';

(async () => {
  const method = (process.env.SFDC_AUTH_METHOD || 'jwt') as any;
  const cfg = {
    auth: {
      method,
      clientId: process.env.SFDC_CLIENT_ID || 'client-id',
      user: process.env.SFDC_USER,
      loginUrl: process.env.SFDC_TOKEN_URL || 'http://localhost:45810',
      privateKeyBase64: process.env.SFDC_JWT_PRIVATE_KEY,
      refreshToken: process.env.SFDC_REFRESH_TOKEN
    },
    sfdcBaseUrl: process.env.SFDC_BASE_URL || 'http://localhost:45810',
    sinceMs: Date.now() - 60_000,
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    workbuoy: {
      baseUrl: process.env.CRM_BASE_URL || 'http://localhost:45802',
      apiKey: process.env.API_KEY || 'dev',
      tenantId: process.env.TENANT_ID || 't1'
    }
  };
  await runOnce(cfg as any);
  console.log('SFDC worker run complete');
})().catch(e=>{ console.error(e); process.exit(1); });
