export type Contact = { name: string; email?: string; phone?: string; updated_at?: number };
export type Opportunity = { title: string; amount?: number; contact_id?: string; updated_at?: number };

export function mapHubSpotEventToContacts(evt: any): Contact[] {
  const list = Array.isArray(evt) ? evt : [evt];
  return list.map((e:any)=>({ name: e.properties?.firstname ? `${e.properties.firstname} ${e.properties.lastname||''}`.trim() : e.name || 'Unknown', email: e.properties?.email, phone: e.properties?.phone, updated_at: Date.now() }));
}

export function mapSalesforceEventToContacts(evt: any): Contact[] {
  const recs = evt.records || evt.Records || [];
  return recs.map((r:any)=>({ name: r.Name || 'Unknown', email: r.Email, phone: r.Phone, updated_at: Date.now() }));
}

export function mapDynamicsEventToContacts(evt: any): Contact[] {
  const recs = evt.value || [];
  return recs.map((r:any)=>({ name: [r.firstname, r.lastname].filter(Boolean).join(' ') || 'Unknown', email: r.emailaddress1, phone: r.mobilephone, updated_at: Date.now() }));
}
