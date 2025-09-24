import fetch from 'node-fetch';
import { wb_connector_ingest_total, wb_connector_errors_total } from './metrics.js';

export type PollerConfig = {
  provider: 'hubspot' | 'salesforce' | 'dynamics';
  providerBaseUrl: string;
  providerToken: string;
  crmBaseUrl: string;
  apiKey: string;
  tenantId: string;
};

type ProviderContact = {
  name?: string;
  firstName?: string;
  first_name?: string;
  email?: string;
  phone?: string;
};

export async function runOnce(cfg: PollerConfig) {
  try {
    const since = Date.now() - 60_000;
    const res = await fetch(`${cfg.providerBaseUrl}/contacts?since=${since}`, {
      headers: { Authorization: `Bearer ${cfg.providerToken}` }
    });
    if (!res.ok) {
      throw new Error('provider fetch failed: ' + res.status);
    }

    const payload = (await res.json()) as unknown;
    const contacts: ProviderContact[] = Array.isArray(payload) ? (payload as ProviderContact[]) : [];

    for (const contact of contacts) {
      const response = await fetch(`${cfg.crmBaseUrl}/api/v1/crm/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': cfg.apiKey,
          'x-tenant-id': cfg.tenantId,
          'x-user-role': 'admin'
        },
        body: JSON.stringify({
          name: contact.name || contact.firstName || contact.first_name || 'Unknown',
          email: contact.email,
          phone: contact.phone,
          updated_at: Date.now()
        })
      });

      if (!response.ok) {
        wb_connector_errors_total.labels(cfg.provider, 'poll').inc();
      } else {
        wb_connector_ingest_total.labels(cfg.provider, 'poll').inc();
      }
    }
  } catch (e) {
    wb_connector_errors_total.labels(cfg.provider, 'poll').inc();
    throw e;
  }
}
