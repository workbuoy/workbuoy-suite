import { getRegistry } from '../../../lib/metrics/registry.js';
export default async function handler(req,res){
  const reg = getRegistry?.();
  try{
    const body = req.body || {};
    const payload = body['csp-report'] || body;
    const client = (await import('prom-client')).default;
    const counter = new client.Counter({
      name:'wb_csp_report_total',
      help:'CSP report-only violations',
      labelNames:['directive'],
      registers:[reg || client.register]
    });
    const dir = payload['violated-directive'] || 'unknown';
    counter.labels(dir).inc();
  }catch(e){}
  return res.status(204).end();
}
