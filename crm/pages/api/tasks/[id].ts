import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/db';
import { apiHandler } from '../../../lib/api/handler';
import { TaskSchema } from '../../../lib/validation/schemas';

export default apiHandler('/api/tasks/[id]', TaskSchema.partial()) (async (req, res, parsed) => {
  const id = String(req.query.id);
  if (req.method === 'GET'){
    const row = await prisma.task.findUnique({ where: { id } });
    if (!row) return res.status(404).json({ error: 'task not found' });
    return res.status(200).json(row);
  }
  if (req.method === 'PUT'){
    const updated = await prisma.task.update({ where: { id }, data: parsed ?? req.body ?? {} });
    return res.status(200).json(updated);
  }
  if (req.method === 'DELETE'){
    await prisma.task.delete({ where: { id } });
    return res.status(204).end();
  }
  res.setHeader('Allow','GET, PUT, DELETE');
  return res.status(405).end();
});