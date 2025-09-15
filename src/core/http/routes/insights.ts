import { Router } from 'express';
import { buildInsights } from '../../../insights/engine';

// NOTE: uses an in-memory CRM snapshot for now (can be replaced later)
const mockCRM = {
  customers: [
    { id: 'C-1', name: 'ACME', overdueAmount: 92000, openDealsAmount: 470000 },
    { id: 'C-2', name: 'Northwind', overdueAmount: 12000, openDealsAmount: 130000 },
  ]
};

export function insightsRouter() {
  const r = Router();
  r.get('/api/insights', async (req, res) => {
    const tenantId = (req as any).wb?.tenantId ?? 'T1';
    const cards = await buildInsights(tenantId, { crm: mockCRM });
    res.json({ items: cards });
  });
  return r;
}
