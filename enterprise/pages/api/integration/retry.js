
import { requireAuth } from '../../../lib/auth.js';
import { requireRole } from '../../../lib/rbac.js';
import { nextRetryBatch, bumpRetry } from '../../../lib/queues/retryQueue.js';

export default async function handler(req,res){
  const user = requireAuth(req, res); if(!user) return;
  if(req.method === 'POST'){
    if(!requireRole(user, ['admin','operator'])){ res.status(403).json({error:'forbidden'}); return; }
    const batch = await nextRetryBatch(Number(req.body?.limit||20));
    res.json({ batch });
    return;
  }
  res.status(405).json({error:'method_not_allowed'});
}
