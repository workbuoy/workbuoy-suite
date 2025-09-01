import Redis from 'ioredis';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const N = parseInt(process.env.WB_REDIS_N || '5000', 10);
const url = process.env.REDIS_URL || 'redis://localhost:6379';
const q = process.env.WB_QUEUE || 'wb:queue:sync';

function percentile(arr:number[], p:number) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a,b)=>a-b);
  const idx = Math.ceil((p/100)*sorted.length)-1;
  return sorted[Math.max(0, Math.min(sorted.length-1, idx))];
}

(async () => {
  const pub = new Redis(url);
  const sub = new Redis(url);

  // Worker measures processing latency
  let processed = 0;
  const durations:number[] = [];
  let stop = false;

  (async function worker(){
    while(!stop) {
      const res = await sub.brpop(q, 1);
      if (res && res[1]) {
        const msg = JSON.parse(res[1]);
        const dt = Date.now() - msg.ts;
        durations.push(dt);
        processed++;
      }
    }
  })();

  const t0 = Date.now();
  for (let i=0;i<N;i++) {
    await pub.lpush(q, JSON.stringify({ id: i, ts: Date.now() }));
  }
  const timeoutAt = Date.now()+120000;
  while (processed < N && Date.now() < timeoutAt) { await new Promise(r=>setTimeout(r,10)); }
  stop = true;

  const t1 = Date.now();
  const report = {
    total: N,
    duration_ms: t1 - t0,
    throughput_ops_per_s: Number((N/((t1-t0)/1000)).toFixed(2)),
    p95_ms: percentile(durations, 95),
    p99_ms: percentile(durations, 99),
    errors: processed < N ? (N-processed) : 0
  };
  mkdirSync('reports', { recursive: true });
  writeFileSync(join('reports','sync_load.json'), JSON.stringify(report, null, 2));

  await pub.quit(); await sub.quit();
  if (report.errors > 0) { console.error('REDIS BLAST partial', report); process.exit(1); }
  console.log('REDIS BLAST PASS', report);
  process.exit(0);
})();
