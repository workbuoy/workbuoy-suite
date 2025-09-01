export type SfdcContact = { Id: string; FirstName?: string; LastName?: string; Email?: string; Phone?: string; LastModifiedDate?: string; };
export type SfdcOpportunity = { Id: string; Name: string; Amount?: number; StageName?: string; LastModifiedDate?: string; AccountId?: string; ContactId?: string; };

export function mapContact(c: SfdcContact) {
  const name = [c.FirstName, c.LastName].filter(Boolean).join(' ').trim() || 'Unknown';
  const updated_at = c.LastModifiedDate ? Math.floor(new Date(c.LastModifiedDate).getTime()) : Date.now();
  return {
    external_id: c.Id,
    name,
    email: c.Email,
    phone: c.Phone,
    custom_fields: { sfdc_id: c.Id, source: 'salesforce' },
    updated_at
  };
}

export function mapOpportunity(o: SfdcOpportunity) {
  const updated_at = o.LastModifiedDate ? Math.floor(new Date(o.LastModifiedDate).getTime()) : Date.now();
  return {
    external_id: o.Id,
    title: o.Name,
    amount: o.Amount,
    custom_fields: { sfdc_id: o.Id, stage: o.StageName, source: 'salesforce' },
    updated_at
  };
}
