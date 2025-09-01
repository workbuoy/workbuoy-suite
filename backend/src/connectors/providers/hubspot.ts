import { Job } from '../types.js';

export function mapHubspotContact(incoming: any) {
  const props = incoming.properties || incoming;
  return {
    name: [props.firstname, props.lastname].filter(Boolean).join(' ') || props.name || 'Unknown',
    email: props.email || null,
    phone: props.phone || null,
    tags: ['hubspot']
  };
}

export function ingestWebhook(body: any, tenant_id: string): Job[] {
  // HubSpot change events: array of objects
  const events = Array.isArray(body) ? body : [body];
  return events.filter(e => e.objectType === 'contact' || e.objectTypeId === '0-1').map((e:any) => ({
    id: e.objectId || e.objectId || String(Date.now()),
    provider: 'hubspot',
    tenant_id,
    type: 'contact',
    payload: e,
    attempt: 0,
    ts: Date.now()
  }));
}

// For MVP, the poll is a stub returning 0 jobs; real implementation would call HubSpot APIs with 'since' timestamps.
export async function pollSince(_since: number, _tenant_id: string): Promise<Job[]> {
  return [];
}
