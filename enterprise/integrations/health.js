import monitoring from '../../../lib/integration/monitoring.js';
import breakers from '../../../lib/integration/circuit-breaker.js';

export default async function handler(req, res){
  if (req.method !== 'GET') return res.status(405).end();
  const stats = await monitoring.snapshot();
  const br = breakers.snapshotAll();
  const evalConnector = (s)=> {
    const err = s.errorRate || 0, p95 = s.p95ms || 0, avail = s.availability || 1;
    let status = 'healthy';
    if (err > 0.05 || p95 > 2000 || avail < 0.99) status='warning';
    if (err > 0.1 || p95 > 5000 || avail < 0.97) status='critical';
    return { ...s, status };
  };
  const detailed = Object.fromEntries(Object.entries(stats).map(([k,v])=>[k, evalConnector(v)]));
  for (const [k,s] of Object.entries(detailed)){ if (br[k] && br[k].state==='OPEN') s.status='critical'; s.breaker = br[k]||null; }
  const counts = Object.values(detailed).reduce((a,c)=>{ a[c.status]=(a[c.status]||0)+1; return a; },{});
  const overall = counts.critical ? 'critical' : (counts.warning ? 'warning' : 'healthy');
  if (overall!=='healthy'){
    await monitoring.triggerAlert?.({ logger: console, slack:{ post: async ({channel,text})=>console.log('Slack',channel,text) } },
      { connector:'ALL', severity: overall, metric:'overall_health', value: overall, threshold:'healthy', context: detailed });
  }
  res.json({ overall, detailed, breakers: br, ts: Date.now() });
}
