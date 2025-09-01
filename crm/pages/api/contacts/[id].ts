import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/db';
import { apiHandler } from '../../../lib/api/handler';
import { ContactSchema } from '../../../lib/validation/schemas';

export default apiHandler('/api/contacts/[id]', ContactSchema.partial()) (async (req, res, parsed) => {
  const id = String(req.query.id);
  if (req.method === 'GET') {
    const row = await prisma.contact.findUnique({ where: { id } });
    if (!row) return res.status(404).json({ error: 'contact not found' });
    return res.status(200).json(row);
  }
  if (req.method === 'PUT') {
    const updated = await prisma.contact.update({ where: { id }, data: parsed ?? req.body ?? {} });
    return res.status(200).json(updated);
  }
  if (req.method === 'DELETE') {
    await prisma.contact.delete({ where: { id } });
    return res.status(204).end();
  }
  res.setHeader('Allow', 'GET, PUT, DELETE');
  return res.status(405).end();
});