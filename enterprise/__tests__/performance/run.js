
// Simple load & performance harness using autocannon
import autocannon from 'autocannon';
import fs from 'fs';
import path from 'path';

const BASE = process.env.PERF_BASE_URL || process.env.E2E_BASE_URL || 'http://localhost:8080';
const OUT_DIR = path.join(process.cwd(), 'observability', 'perf-reports');
await fs.promises.mkdir(OUT_DIR, { recursive: true });

const endpoints = [
  { name: 'modes_handle', method: 'POST', url: '/api/modes/handle', body: JSON.stringify({ mode: 'Calm', input: 'ping', context: {} }), headers: { 'content-type': 'application/json' } },
  { name: 'kits_download', method: 'GET',  url: '/api/kits/download?token=demo' },
  { name: 'roles_domain', method: 'GET',  url: '/api/roles?domain=sales' },
];

async function bench(ep){
  const url = BASE.replace(/\/$/, '') + ep.url;
  console.log(`\n→ Benchmarking ${ep.name} ${ep.method} ${url}`);
  const instance = await autocannon({
    url,
    method: ep.method,
    duration: parseInt(process.env.PERF_DURATION || '10', 10), // seconds
    connections: parseInt(process.env.PERF_CONN || '5', 10),
    amount: 0,
    headers: ep.headers || {},
    body: ep.body || undefined,
    timeout: 10
  });
  const r = instance;
  const summary = {
    name: ep.name,
    url,
    method: ep.method,
    started: new Date().toISOString(),
    duration_sec: r.duration,
    connections: r.connections,
    requests: r.requests,
    throughput_bps: r.throughput,
    latency: {
      p50: r.latency.p50,
      p95: r.latency.p95,
      p99: r.latency.p99
    },
    rps: {
      mean: r.requests.mean,
      p50: r.requests.p50,
      p95: r.requests.p95
    }
  };
  console.log(`p50: ${summary.latency.p50} ms • p95: ${summary.latency.p95} ms • RPS mean: ${summary.rps.mean}`);
  return summary;
}

const results = [];
for (const ep of endpoints){
  try {
    results.push(await bench(ep));
  } catch (e){
    console.error('Benchmark failed for', ep.name, e.message);
    results.push({ name: ep.name, error: e.message });
  }
}

const outPath = path.join(OUT_DIR, `perf-${Date.now()}.json`);
await fs.promises.writeFile(outPath, JSON.stringify({ base: BASE, results }, null, 2));
const latestPath = path.join(OUT_DIR, `latest.json`);
await fs.promises.writeFile(latestPath, JSON.stringify({ base: BASE, results }, null, 2));
console.log(`\nSaved report: ${outPath}`);
