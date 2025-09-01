import { publishSignal } from '../../../lib/signals.js';
import { startTrace } from '../../../lib/tracing.js';

export default async function handler(req,res){
  const trace = startTrace(req);
  const data = {"mrr": 124500, "arr": 1494000, "cash_on_hand": 325000, "burn": 68000, "forecast": [{"month": "2025-09", "mrr": 130000}]};
  // publish a signal each time module queried
  publishSignal({
    type: 'finance', title: 'Update: finance', urgency: 0.6, impact: 0.7, severity:'info',
    payload: data
  });
  const t = trace.end('/api/cxm/finance', 200);
  res.setHeader('x-request-id', t.requestId);
  res.json({ ok:true, data, requestId: t.requestId });
}
