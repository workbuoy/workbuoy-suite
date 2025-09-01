import { auditLog } from '../../../lib/audit.js';
export default function handler(req,res){
  const proposal = { id: 'p'+Date.now(), change: req.body?.change, rationale: req.body?.rationale, status:'proposed' };
  auditLog({ action:'meta:propose', details: proposal });
  res.json({ ok:true, proposal });
}
