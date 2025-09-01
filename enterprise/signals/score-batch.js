
import { scoreBatch } from '../../../lib/perf/scoringBatcher.js';
import { registerDataIntegrationMetrics, METRICS } from '../../../lib/observability/metrics.data-int.js';
import client from 'prom-client';

export default async function handler(req,res){
  registerDataIntegrationMetrics(client.register);
  if(req.method!=='POST'){ res.status(405).json({error:'method_not_allowed'}); return; }
  const signals = Array.isArray(req.body?.signals) ? req.body.signals : [];
  const t0 = Date.now();
  const out = await scoreBatch(signals);
  const dt = Date.now()-t0;
  try{ METRICS.wb_signal_batch_latency_ms.observe(dt); }catch{}
  res.json({ results: out, p95_ms_estimate: dt });
}
