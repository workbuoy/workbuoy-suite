import express from 'express';
import { verifyProviderSignature } from './signature.js';
import { wb_connector_ingest_total, wb_connector_errors_total } from './metrics.js';

export function connectorsRouterRawBody(raw: Buffer, provider: string, headers: any) {
  const secrets = {
    hubspot: process.env.CONNECTOR_HMAC_SECRET_HUBSPOT || 'dev-secret',
    salesforce: process.env.CONNECTOR_HMAC_SECRET_SALESFORCE || 'dev-secret',
    dynamics: process.env.CONNECTOR_HMAC_SECRET_DYNAMICS || 'dev-secret',
  } as const;
  const secret = (secrets as any)[provider] || process.env.CONNECTOR_HMAC_SECRET || 'dev-secret';
  const bypass = process.env.CONNECTOR_SIGNATURE_BYPASS === '1';
  if (bypass) return true;
  return verifyProviderSignature(provider, secret, raw, headers);
}

export function connectorsRouter() {
  const r = express.Router();

  r.post('/api/v1/connectors/:provider/webhook', (req:any, res) => {
    const provider = String(req.params.provider || '');
    const raw: Buffer = req.rawBody || Buffer.from(JSON.stringify(req.body||{}));
    const ok = connectorsRouterRawBody(raw, provider, req.headers);
    if (!ok) {
      wb_connector_errors_total.labels(provider,'webhook').inc();
      return res.status(401).json({ error: 'invalid signature' });
    }

    // Minimal ingest: accept both array and object; count items
    const payload = req.body;
    const events = Array.isArray(payload) ? payload : (payload && payload.events) ? payload.events : [payload];
    wb_connector_ingest_total.labels(provider,'webhook').inc(events.length || 1);
    return res.status(202).json({ ok: true, received: events.length || 1 });
  });

  return r;
}
