import { Router } from 'express';

export function buoyRouter() {
  const r = Router();
  r.post('/complete', async (req: any, res)=>{
    const wb = req.wb || {};
    const { intent='echo', params={} } = req.body || {};
    // MVP: echo intent for verification; explanations present
    const explanations = [{
      reasoning: `Handled intent '${intent}' in MVP echo mode`,
      policyBasis: ['local:read'],
      confidence: 0.6
    }];
    res.json({ result: { ok:true, payload: params }, explanations, confidence: 0.6, correlationId: wb.correlationId });
  });
  return r;
}
