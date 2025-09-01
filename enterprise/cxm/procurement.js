import { publishSignal } from '../../../lib/signals.js';
import { startTrace } from '../../../lib/tracing.js';

export default async function handler(req,res){
  const trace = startTrace(req);
  const data = {"rfqs": [{"id": "RFQ-12", "item": "Laptops", "status": "open", "bids": 3}, {"id": "RFQ-13", "item": "Support", "status": "draft", "bids": 0}], "shortlist": [{"vendor": "Acme", "score": 86}, {"vendor": "Globex", "score": 79}]};
  // publish a signal each time module queried
  publishSignal({
    type: 'procurement', title: 'Update: procurement', urgency: 0.6, impact: 0.7, severity:'info',
    payload: data
  });
  const t = trace.end('/api/cxm/procurement', 200);
  res.setHeader('x-request-id', t.requestId);
  res.json({ ok:true, data, requestId: t.requestId });
}
