import { Job } from '../types.js';

export function mapDynamicsContact(rec: any) {
  return {
    name: rec.fullname || [rec.firstname, rec.lastname].filter(Boolean).join(' ') || 'Unknown',
    email: rec.emailaddress1 || null,
    phone: rec.telephone1 || null,
    tags: ['dynamics']
  };
}

export function ingestWebhook(body: any, tenant_id: string): Job[] {
  const list = Array.isArray(body) ? body : [body];
  return list.filter((r:any) => r.logicalName==='contact' || r.entity==='contact').map((r:any) => ({
    id: r.id || r.contactid || String(Date.now()),
    provider: 'dynamics',
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
