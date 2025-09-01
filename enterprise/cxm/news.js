import { publishSignal } from '../../../lib/signals.js';
import { startTrace } from '../../../lib/tracing.js';

export default async function handler(req,res){
  const trace = startTrace(req);
  const data = {"items": [{"title": "Customer X renewed 2y", "source": "CRM", "ts": "2025-08-20"}, {"title": "New RFP released", "source": "Procurement", "ts": "2025-08-22"}]};
  // publish a signal each time module queried
  publishSignal({
    type: 'news', title: 'Update: news', urgency: 0.6, impact: 0.7, severity:'info',
    payload: data
  });
  const t = trace.end('/api/cxm/news', 200);
  res.setHeader('x-request-id', t.requestId);
  res.json({ ok:true, data, requestId: t.requestId });
}
