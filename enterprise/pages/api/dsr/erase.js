import { enqueue } from '../../../lib/queue/index.js';
import { appendAudit } from '../../../lib/audit/store.js';

export default async function handler(req,res){
  const tenant_id = req.headers['x-tenant-id'] || 'demo-tenant';
  const subject = req.body?.subject || req.query?.subject;
  if(!subject) return res.status(400).json({ error:'missing_subject' });
  await enqueue('workbuoy','erasure',{ tenant_id, subject });
  await appendAudit({ tenant_id, action:'dsr_erase_requested', target: subject });
  res.json({ ok:true, job:'queued', subject });
}
