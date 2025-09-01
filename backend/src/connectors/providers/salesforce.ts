import { Job } from '../types.js';

export function mapSalesforceContact(rec: any) {
  return {
    name: [rec.FirstName, rec.LastName].filter(Boolean).join(' ') || rec.Name || 'Unknown',
    email: rec.Email || null,
    phone: rec.Phone || null,
    tags: ['salesforce']
  };
}

export function ingestWebhook(body: any, tenant_id: string): Job[] {
  const records = Array.isArray(body.records) ? body.records : [body];
  return records.filter((r:any) => (r.attributes?.type==='Contact') || r.type==='Contact').map((r:any) => ({
    id: r.Id || String(Date.now()),
    provider: 'salesforce',
    tenant_id,
    type: 'contact',
    payload: r,
    attempt: 0,
    ts: Date.now()
  }));
}

export async function pollSince(_since: number, _tenant_id: string): Promise<Job[]> {
  return [];
}
