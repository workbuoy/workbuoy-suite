import { withAuth } from '../../lib/auth/oidc';
const fetch = (...args)=>import('node-fetch').then(({default: fetch})=>fetch(...args));

async function q(expr){
  const u = process.env.PROMETHEUS_URL;
  if (!u) return null;
  const url = new URL('/api/v1/query', u);
  url.searchParams.set('query', expr);
  const headers = {};
  if (process.env.PROMETHEUS_BEARER) headers['Authorization'] = 'Bearer ' + process.env.PROMETHEUS_BEARER;
  const r = await fetch(url, { headers });
  if (!r.ok) return null;
  const j = await r.json();
  return j.data?.result || null;
}

export default withAuth(async function handler(_req, res){
  const failure = await q('(sum(rate(wb_connector_sync_failure_total[1h])) / (sum(rate(wb_connector_sync_success_total[1h])) + 1)) * 100');
  const p95 = await q('histogram_quantile(0.95, sum(rate(wb_connector_sync_seconds_bucket[5m])) by (le,connector))');
  const freshness = await q('(time() - max(wb_connector_last_success_timestamp) by (tenant,connector)) / 60');
  res.json({ failure, p95, freshness });
}, { roles: ['admin'] });
