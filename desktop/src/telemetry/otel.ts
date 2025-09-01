import fetch from 'node-fetch';

const OTLP_URL = process.env.OTLP_HTTP_URL || 'http://127.0.0.1:4318/v1/traces';

export async function span(name: string, attributes: Record<string, any> = {}) {
  // Minimal OTLP-ish JSON envelope (mock collector just counts posts)
  const body = {
    resourceSpans: [{
      resource: { attributes: [{ key: 'service.name', value: { stringValue: 'workbuoy-desktop' } }] },
      scopeSpans: [{
        scope: { name: 'custom' },
        spans: [{ name, attributes: Object.entries(attributes).map(([k,v])=>({ key:k, value: { stringValue: String(v) } })) }]
      }]
    }]
  };
  try {
    const res = await fetch(OTLP_URL, { method: 'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify(body) });
    return res.ok;
  } catch { return false; }
}
