
import { requireAuth } from '../../../lib/auth.js';
import { approveSuggestions } from '../../../lib/data/cleanupEngine.js';
import { METRICS, registerDataIntegrationMetrics } from '../../../lib/observability/metrics.data-int.js';
import client from 'prom-client';
import { requireRole } from '../../../lib/rbac.js';

export default function handler(req,res){
  registerDataIntegrationMetrics(client.register);
  if(req.method !== 'POST'){ res.status(405).json({error:'method_not_allowed'}); return; }
  const user = requireAuth(req, res); if(!user) return;
  if(!requireRole(user, ['admin','data_steward'])){ res.status(403).json({error:'forbidden'}); return; }

  const ids = Array.isArray(req.body?.suggestion_ids) ? req.body.suggestion_ids : [];
  const out = approveSuggestions(ids, user);
  try{
    METRICS.wb_data_quality_applied_total.inc(out.applied.length);
    out.failed.forEach(f=>METRICS.wb_data_quality_failed_total.labels(f.reason||'unknown').inc());
  }catch{}
  res.json(out);
}
