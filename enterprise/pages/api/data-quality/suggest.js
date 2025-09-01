
import { requireAuth } from '../../../lib/auth.js';
import { suggestCleanup } from '../../../lib/data/cleanupEngine.js';
import { METRICS, registerDataIntegrationMetrics } from '../../../lib/observability/metrics.data-int.js';
import client from 'prom-client';

export default function handler(req,res){
  registerDataIntegrationMetrics(client.register);
  if(req.method !== 'POST'){ res.status(405).json({error:'method_not_allowed'}); return; }
  const user = requireAuth(req, res); if(!user) return; // will send 401

  const records = Array.isArray(req.body?.records) ? req.body.records : [];
  const suggestions = suggestCleanup(records, req.body?.source||'manual', user.email);
  try{
    METRICS.wb_data_quality_suggested_total.inc(suggestions.length);
    suggestions.forEach(s=>METRICS.wb_data_quality_confidence_histogram.observe(s.confidence||0));
  }catch{}
  res.json({ suggestions });
}
