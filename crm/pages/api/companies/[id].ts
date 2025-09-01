import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = String(req.query.id);
  if (req.method === 'GET') {
    const row = await prisma.companie.findUnique({ where: { id } });
    if (!row) return res.status(404).json({ error: 'companie not found' });
    return res.status(200).json(row);
  }
  if (req.method === 'PUT') {
    const updated = await prisma.companie.update({ where: { id }, data: req.body ?? {} });
    return res.status(200).json(updated);
  }
  if (req.method === 'DELETE') {
    await prisma.companie.delete({ where: { id } });
    return res.status(204).end();
  }
  res.setHeader('Allow', 'GET, PUT, DELETE');
  return res.status(405).end();
}
