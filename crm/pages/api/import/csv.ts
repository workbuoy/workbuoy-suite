import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/db';
import { parseCSV } from '../../lib/import/csv';

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (req.method !== 'POST') { res.setHeader('Allow','POST'); return res.status(405).end(); }
  const { csv, kind } = req.body || {};
  if (!csv || !kind) return res.status(400).json({ error: 'csv and kind are required' });
  const rows = parseCSV(String(csv));
  const created: any[] = [];
  if (kind === 'contacts'){
    for (const r of rows){
      const company = r.company ? await prisma.company.upsert({
        where: { name: r.company },
        update: {},
        create: { name: r.company, domain: r.domain || null }
      }) : null;
      const c = await prisma.contact.create({
        data: { name: r.name, email: r.email || null, phone: r.phone || null, companyId: company?.id || null }
      });
      created.push(c);
    }
  } else if (kind === 'companies'){
    for (const r of rows){
      const c = await prisma.company.create({ data: { name: r.name, domain: r.domain || null } });
      created.push(c);
    }
  } else {
    return res.status(400).json({ error: 'unsupported kind' });
  }
  return res.status(201).json({ ok:true, count: created.length });
}
