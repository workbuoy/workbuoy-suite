export type DynContact = { contactid: string; firstname?: string; lastname?: string; emailaddress1?: string; mobilephone?: string; modifiedon?: string; };
export type DynOpportunity = { opportunityid: string; name: string; estimatedvalue?: { value: number }; stageid?: string; modifiedon?: string; };

export function mapContact(c: DynContact) {
  const name = [c.firstname, c.lastname].filter(Boolean).join(' ').trim() || 'Unknown';
  const updated_at = c.modifiedon ? Math.floor(new Date(c.modifiedon).getTime()) : Date.now();
  return {
    external_id: c.contactid,
    name,
    email: c.emailaddress1,
    phone: c.mobilephone,
    custom_fields: { dynamics_id: c.contactid, source: 'dynamics' },
    updated_at
  };
}

export function mapOpportunity(o: DynOpportunity) {
  const updated_at = o.modifiedon ? Math.floor(new Date(o.modifiedon).getTime()) : Date.now();
  return {
    external_id: o.opportunityid,
    title: o.name,
    amount: o.estimatedvalue?.value,
    custom_fields: { dynamics_id: o.opportunityid, stage: o.stageid, source: 'dynamics' },
    updated_at
  };
}
