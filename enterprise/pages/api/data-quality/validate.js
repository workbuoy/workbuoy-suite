import { findSimilarRecords } from '../../../lib/data-quality/hygiene-engine.js';
const db = { async findDedupeCandidates({ domainHint, nameInitial, limit=500 }){
  return [
    { id: 'c1', name: 'Jonas Example', email: `jonas@${domainHint||'example.com'}`, phone: '12345678' },
    { id: 'c2', name: 'Jona Exmple', email: `jona@${domainHint||'example.com'}`, phone: '12345678' },
    { id: 'c3', name: 'Jane Customer', email: 'jane@else.com', phone: '99999999' },
  ].slice(0, limit);
}};
export default async function handler(req,res){
  if (req.method !== 'POST') return res.status(405).end();
  const entity = req.body||{};
  const matches = await findSimilarRecords(entity, { db });
  const issues = [];
  if (!entity.email && !entity.phone) issues.push({ field:'contact', level:'warning', msg:'Missing email/phone' });
  if ((entity.name||'').length < 3) issues.push({ field:'name', level:'info', msg:'Short name may reduce dedupe quality' });
  res.json({ ok:true, matches, issues });
}
