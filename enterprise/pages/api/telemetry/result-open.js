import registry, { wb_result_open_total } from '../../../lib/metrics/registry.js';

export default async function handler(req, res){
  if(req.method!=='POST'){ return res.status(405).end(); }
  const { source } = req.body || {};
  wb_result_open_total.inc({source: source || 'unknown'}, 1);
  res.status(204).end();
}
