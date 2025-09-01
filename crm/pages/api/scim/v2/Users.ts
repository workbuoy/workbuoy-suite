import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/db';

function auth(req: NextApiRequest, res: NextApiResponse){
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i,'');
  if (!process.env.SCIM_BEARER || token !== process.env.SCIM_BEARER){
    res.status(401).json({ error: 'unauthorized' }); return false;
  }
  return true;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if(!auth(req, res)) return;
  if (req.method === 'GET'){
    const users = await prisma.user.findMany();
    return res.json({
      Resources: users.map(u => ({ id: u.id, userName: u.email, name: { formatted: u.name || '' }, active: true })),
      totalResults: users.length,
      itemsPerPage: users.length,
      startIndex: 1,
      schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse']
    });
  }
  if (req.method === 'POST'){
    const { userName, name } = req.body || {};
    const u = await prisma.user.upsert({
      where: { email: userName },
      update: { name: name?.formatted || name?.givenName || null },
      create: { email: userName, name: name?.formatted || null }
    });
    return res.status(201).json({ id: u.id, userName: u.email, name: { formatted: u.name || '' } });
  }
  return res.status(405).end();
}
