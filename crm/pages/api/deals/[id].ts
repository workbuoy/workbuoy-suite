import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/db';
import { apiHandler } from '../../../lib/api/handler';
import { DealSchema } from '../../../lib/validation/schemas';

export default apiHandler('/api/deals/[id]', DealSchema.partial()) (async (req, res, parsed) => {
  const id = String(req.query.id);
  if (req.method === 'GET') {
    const row = await prisma.deal.findUnique({ where: { id } });
    if (!row) return res.status(404).json({ error: 'deal not found' });
    return res.status(200).json(row);
  }
  if (req.method === 'PUT') {
    const updated = await prisma.deal.update({ where: { id }, data: parsed ?? req.body ?? {} });
    return res.status(200).json(updated);
  }
  if (req.method === 'DELETE') {
    await prisma.deal.delete({ where: { id } });
    return res.status(204).end();
  }
  res.setHeader('Allow', 'GET, PUT, DELETE');
  return res.status(405).end();
});