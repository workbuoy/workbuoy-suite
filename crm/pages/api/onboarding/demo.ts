import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/db';
import { requireWriteRole } from '../../../lib/rbac';

import { requireWriteRole } from '../../../lib/rbac';
export default async function handler(_req: NextApiRequest, res: NextApiResponse){
  if (process.env.WB_DEMO_ENABLE !== 'true') return res.status(403).json({ error: 'demo_disabled' });
  if (!requireWriteRole(_req, res)) return;
  // Seed a compact demo dataset; in production, you can proxy to Enterprise demo dataset.
  const co = await prisma.company.upsert({ where: { name: 'DemoCorp' }, update: {}, create: { name: 'DemoCorp', domain: 'demo.local' } });
  const alice = await prisma.contact.upsert({ where: { email: 'alice@demo.local' }, update: {}, create: { name: 'Alice Demo', email: 'alice@demo.local', companyId: co.id } });
  const deal = await prisma.deal.create({ data: { name: 'Pilot-avtale', amount: 12000, stage: 'Lead', companyId: co.id } });
  await prisma.task.create({ data: { title: 'Ring Alice', companyId: co.id, contactId: alice.id, status: 'open' } });
  return res.status(200).json({ ok: true, companyId: co.id, dealId: deal.id });
}
