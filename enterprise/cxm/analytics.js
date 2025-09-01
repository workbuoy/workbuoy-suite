import { publishSignal } from '../../../lib/signals.js';
import { startTrace } from '../../../lib/tracing.js';

export default async function handler(req,res){
  const trace = startTrace(req);
  const data = {"kpis": [{"name": "Activation", "value": 0.42}, {"name": "DAU", "value": 1800}]};
  // publish a signal each time module queried
  publishSignal({
    type: 'analytics', title: 'Update: analytics', urgency: 0.6, impact: 0.7, severity:'info',
    payload: data
  });
  const t = trace.end('/api/cxm/analytics', 200);
  res.setHeader('x-request-id', t.requestId);
  res.json({ ok:true, data, requestId: t.requestId });
}
