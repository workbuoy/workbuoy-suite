import { auditLog } from '../../../lib/audit.js';
export default function handler(req,res){
  const { id } = req.body||{};
  auditLog({ action:'meta:approve', details:{ id } });
  res.json({ ok:true, id, status:'approved' });
}
