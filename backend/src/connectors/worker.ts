import fetch from 'node-fetch';
import { wb_connector_ingest_total, wb_connector_errors_total } from './metrics.js';

export type PollerConfig = {
  provider: 'hubspot'|'salesforce'|'dynamics',
  providerBaseUrl: string,
  providerToken: string,
  crmBaseUrl: string,
  apiKey: string,
  tenantId: string
};

export async function runOnce(cfg: PollerConfig) {
  try {
    const since = Date.now() - 60_000;
    // Generic provider fetch shape: GET /contacts?since=<ts> returns array of contacts
    const pr = await fetch(`${cfg.providerBaseUrl}/contacts?since=${since}`, { headers: { Authorization: `Bearer ${cfg.providerToken}` } });
    if (!pr.ok) throw new Error('provider fetch failed: '+pr.status);
    const contacts = await pr.json();
    for (const c of contacts) {
      const res = await fetch(`${cfg.crmBaseUrl}/api/v1/crm/contacts`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'x-api-key': cfg.apiKey, 'x-tenant-id': cfg.tenantId, 'x-user-role': 'admin' },
        body: JSON.stringify({ name: c.name || c.firstName || 'Unknown', email: c.email, phone: c.phone, updated_at: Date.now() })
      });
      if (!res.ok) wb_connector_errors_total.labels(cfg.provider,'poll').inc();
      else wb_connector_ingest_total.labels(cfg.provider,'poll').inc();
    }
  } catch (e) {
    wb_connector_errors_total.labels(cfg.provider,'poll').inc();
    throw e;
  }
}
