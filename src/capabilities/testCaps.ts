export const testCaps = {
  'crm.lead.route': {
    suggest: async () => ({ routeTo: 'AE-42' }),
    prepare: async () => ({ previewEmail: 'Would route to AE-42 and draft email' }),
    execute: async () => ({ routed: true, assignee: 'AE-42' })
  },
  'finance.invoice.prepareDraft': {
    suggest: async () => ({ lineItems: 3, subtotal: 1200 }),
    prepare: async () => ({ draftId: 'INV-DRAFT-1', subtotal: 1200 }),
    execute: async () => ({ invoiceId: 'INV-1001', status: 'draft' })
  }
} as const;
