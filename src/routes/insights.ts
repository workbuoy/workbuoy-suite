import { Router } from 'express';
import { buildInsights } from '../insights/engine';

// Very small in-memory projection. Replace by repos later.
const mockCRM = {
  customers: [
    { id: 'C-1', name: 'ACME', overdueAmount: 89000, openDealsAmount: 450000 },
    { id: 'C-2', name: 'Beta', overdueAmount: 12000, openDealsAmount: 9000 },
  ]
};
const mockFinance = {
  aging: { over30: 67000 }
};

export function insightsRouter() {
  const r = Router();
  r.get('/', async (req: any, res, next) => {
    try {
      const tenantId = String(req.headers['x-tenant-id'] || 'T1');
      const cards = await buildInsights(tenantId, { crm: mockCRM, finance: mockFinance });
      res.json({ items: cards });
    } catch (e) { next(e); }
  });
  return r;
}
