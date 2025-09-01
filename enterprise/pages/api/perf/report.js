import { wbPerfSmokeP95 } from '../../../lib/metrics/registry.js';
export default function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'method_not_allowed'});
  const token = req.headers['x-perf-token'];
  if(!token || token !== (process.env.PERF_REPORT_TOKEN||'')) return res.status(403).json({error:'forbidden'});
  const { p95=0 } = req.body||{};
  try{ wbPerfSmokeP95.set(Number(p95)); }catch(_){}
  res.json({ok:true});
}
