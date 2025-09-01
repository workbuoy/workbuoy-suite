// After generating SDK into sdk/gen/ts
import { Configuration, DefaultApi } from '../sdk/gen/ts';

const cfg = new Configuration({ basePath: process.env.API_BASE_URL || 'http://localhost:3000', headers: { 'x-api-key': process.env.API_KEY || 'dev-123', 'x-tenant-id': process.env.TENANT_ID || 'demo-tenant' } });
const api = new DefaultApi(cfg);

(async () => {
  const res = await fetch(`${cfg.basePath}/api/v1/crm/contacts?limit=10`, { headers: cfg.headers });
  console.log(await res.json());
})();
