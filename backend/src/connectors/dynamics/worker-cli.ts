import { runOnce } from './worker.js';

(async () => {
  const cfg = {
    auth: {
      tenantId: process.env.DYN_TENANT_ID || 'tenant',
      clientId: process.env.DYN_CLIENT_ID || 'client',
      clientSecret: process.env.DYN_CLIENT_SECRET || 'secret',
      scope: process.env.DYN_SCOPE || 'https://example.crm.dynamics.com/.default',
      tokenUrl: process.env.DYN_TOKEN_URL
    },
    baseUrl: process.env.DYN_BASE_URL || 'http://localhost:45910',
    sinceMs: Date.now() - 60_000,
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    workbuoy: {
      baseUrl: process.env.CRM_BASE_URL || 'http://localhost:45802',
      apiKey: process.env.API_KEY || 'dev',
      tenantId: process.env.TENANT_ID || 't1'
    }
  };
  await runOnce(cfg as any);
  console.log('Dynamics worker run complete');
})().catch(e=>{ console.error(e); process.exit(1); });
