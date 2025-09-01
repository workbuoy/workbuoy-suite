import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import Redis from 'ioredis';

const N = parseInt(process.env.WB_REDIS_N || '2000', 10);
const url = process.env.REDIS_URL || 'redis://localhost:6379';
const q = process.env.WB_QUEUE || 'wb:queue';

(async () => {
  const pub = new Redis(url);
  const sub = new Redis(url);

  // Worker
  let processed = 0; let stop=false;
  (async function worker(){
    while(!stop) {
      const res = await sub.brpop(q, 1);
      if (res && res[1]) {
        processed++;
      }
    }
  })();

  const t0 = Date.now();
  for (let i=0;i<N;i++) { await pub.lpush(q, JSON.stringify({ id: i, type: 'contact.create' })); }
  // Wait until drained or timeout
  const timeoutAt = Date.now()+60000;
  while (processed < N && Date.now() < timeoutAt) { await new Promise(r=>setTimeout(r,50)); }
  stop = true;

  const ms = Date.now() - t0;
  const errors = processed < N ? (N - processed) : 0;
  mkdirSync(path.join(process.cwd(), 'reports'), { recursive: true });
  writeFileSync(path.join(process.cwd(), 'reports', 'redis_soak.json'), JSON.stringify({ queued: N, processed, duration_ms: ms, backlog: Math.max(0, N-processed) }, null, 2));

  await pub.quit(); await sub.quit();
  if (errors>0) { console.error('REDIS SOAK partial', { processed, N }); process.exit(1); }
  console.log('REDIS SOAK PASS', processed, 'in', ms, 'ms');
  process.exit(0);
})();
