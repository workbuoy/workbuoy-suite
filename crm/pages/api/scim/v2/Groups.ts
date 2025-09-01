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
    const groups = await prisma.group.findMany({ include: { members: { include: { user: true } } } });
    return res.json({
      Resources: groups.map(g => ({ id: g.id, displayName: g.displayName, members: g.members.map(m => ({ value: m.userId, display: m.user.email })) })),
      totalResults: groups.length,
      itemsPerPage: groups.length,
      startIndex: 1,
      schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse']
    });
  }
  if (req.method === 'POST'){
    const { displayName, members } = req.body || {};
    const grp = await prisma.group.upsert({
      where: { displayName },
      update: {},
      create: { displayName }
    });
    if (Array.isArray(members)){
      for (const m of members){
        await prisma.groupMember.upsert({
          where: { userId_groupId: { userId: m.value, groupId: grp.id } },
          update: {},
          create: { userId: m.value, groupId: grp.id }
        });
      }
    }
    return res.status(201).json({ id: grp.id, displayName: grp.displayName });
  }
  return res.status(405).end();
}
