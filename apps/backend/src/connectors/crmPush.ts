import fetch from 'node-fetch';

type PushFn = (tenant_id: string, type: 'contact'|'opportunity', rec: any) => Promise<void>;
let delegate: PushFn | null = null;

export function setCrmPushDelegate(fn: PushFn) {
  delegate = fn;
}

export async function pushToCrm(tenant_id: string, type: 'contact'|'opportunity', rec: any) {
  if (delegate) return delegate(tenant_id, type, rec);
  const base = process.env.CRM_BASE_URL || 'http://localhost:3000';
  const path = type === 'contact' ? '/api/v1/crm/contacts' : '/api/v1/crm/opportunities';
  const r = await fetch(base + path, {
    method: 'POST',
    headers: { 'Content-Type':'application/json', 'x-tenant-id': tenant_id, 'x-api-key': process.env.API_KEY_DEV || 'dev-123' },
    body: JSON.stringify(rec)
  });
  if (!r.ok) throw new Error(`CRM push failed: ${r.status}`);
}
