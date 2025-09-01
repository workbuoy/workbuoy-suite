import { runOnce } from './worker.js';

(async () => {
  const provider = (process.env.POLL_PROVIDER || 'hubspot') as any;
  const providerBaseUrl = process.env.POLL_PROVIDER_BASE || 'http://localhost:45801';
  const providerToken = process.env.POLL_PROVIDER_TOKEN || 'dev';
  const crmBaseUrl = process.env.CRM_BASE_URL || 'http://localhost:3000';
  const apiKey = process.env.API_KEY || 'dev';
  const tenantId = process.env.TENANT_ID || 't1';
  await runOnce({ provider, providerBaseUrl, providerToken, crmBaseUrl, apiKey, tenantId });
  console.log('poll runOnce completed');
})().catch(e=>{ console.error(e); process.exit(1); });
