
import { requireAuth } from '../../../lib/auth.js';
import { listQueue } from '../../../lib/data/cleanupEngine.js';
import { requireRole } from '../../../lib/rbac.js';

export default async function handler(req,res){
  if(req.method !== 'GET'){ res.status(405).json({error:'method_not_allowed'}); return; }
  const user = requireAuth(req, res); if(!user) return;
  if(!requireRole(user, ['admin','data_steward'])){ res.status(403).json({error:'forbidden'}); return; }
  const statuses = (req.query?.status||'pending,failed').split(',').map(s=>s.trim());
  const items = await listQueue(statuses, Number(req.query?.limit||100));
  res.json({ items });
}
