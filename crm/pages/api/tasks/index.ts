import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/db';
import { apiHandler } from '../../../lib/api/handler';
import { TaskSchema } from '../../../lib/validation/schemas';

export default apiHandler('/api/tasks', TaskSchema) (async (req, res, parsed) => {
  if (req.method === 'GET'){
    const rows = await prisma.task.findMany({ orderBy: { createdAt: 'desc' } });
    return res.status(200).json(rows);
  }
  if (req.method === 'POST'){
    const created = await prisma.task.create({ data: parsed ?? req.body ?? {} });
    return res.status(201).json(created);
  }
  res.setHeader('Allow','GET, POST');
  return res.status(405).end();
});