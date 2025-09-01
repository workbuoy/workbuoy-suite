// lib/meta/metrics.js
// Minimal Prometheus HTTP API client for SLO checks
// Uses global fetch (Node 18+) or node-fetch polyfill if needed

const DEFAULT_WINDOW = '5m';

function substitute(template, vars){
  return template.replace(/\$\{(\w+)\}/g, (_,k)=> String(vars[k]??''));
}

export async function promQueryInstant(baseUrl, query){
  const url = new URL('/api/v1/query', baseUrl);
  url.searchParams.set('query', query);
  const res = await fetch(url, { method: 'GET' });
  if(!res.ok) throw new Error(`Prometheus query failed: ${res.status}`);
  const data = await res.json();
  if(data.status !== 'success') throw new Error(`Prometheus error: ${data.status}`);
  return data.data.result;
}

export async function getSloSnapshot({ baseUrl, experimentId, latencyQuery, errorRateQuery }){
  // Provide sensible defaults keyed by experiment label
  const vars = { experimentId, window: DEFAULT_WINDOW };
  const qLatency = latencyQuery || substitute(
    'histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket{experiment="${experimentId}"}[${window}])) by (le)) * 1000',
    vars
  );
  const qError = errorRateQuery || substitute(
    'sum(rate(http_requests_total{experiment="${experimentId}",status=~"5.."}[${window}])) / clamp_min(sum(rate(http_requests_total{experiment="${experimentId}"}[${window}])), 1e-9)',
    vars
  );
  const [lat, err] = await Promise.all([
    promQueryInstant(baseUrl, qLatency),
    promQueryInstant(baseUrl, qError)
  ]);
  function firstValue(arr){
    if(!arr || !arr[0] || !arr[0].value) return null;
    const v = parseFloat(arr[0].value[1]);
    return Number.isFinite(v) ? v : null;
    }
  return {
    p95_latency_ms: firstValue(lat),
    error_rate: firstValue(err)
  };
}
