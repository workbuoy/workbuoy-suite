import { spawn } from 'child_process';
import fs from 'fs';
import { SyncEngine } from './sync_lib.js';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:45890';
const OPS = Number(process.env.LOAD_OPS || 1200);

function wait(ms){ return new Promise(r=>setTimeout(r,ms)); }
async function startServer(){
  const ps = spawn(process.execPath, ['scripts/mock_crm_api_conflict.js'], { stdio: 'inherit', env: { ...process.env, FAIL_RATE: process.env.FAIL_RATE || '0.01' } });
  await wait(500);
  return ps;
}

function headers(){ return {'content-type':'application/json'}; }

async function main(){
  const server = await startServer();
  try{
    const engine = new SyncEngine({ baseUrl: BASE_URL, headers, mergePolicy: 'lww', concurrency: 12, maxRetries: 8 });
    // enqueue many
    for (let i=0;i<OPS;i++){
      await engine.enqueueCreateContact({ name:`Bulk ${i}`, email:`bulk${i}@x.tld`, updated_at: Date.now() });
    }
    const t0 = Date.now();
    let after = OPS;
    let passes = 0;
    while (after > 0 && passes < 50){
      const rep = await engine.syncOnce();
      after = rep.after;
      passes++;
    }
    const t1 = Date.now();

    const duration = (t1 - t0)/1000;
    const m = engine.metrics;
    const throughput = m.succeeded / Math.max(0.001, duration);
    const errorRate = m.failed / Math.max(1, (m.succeeded + m.failed));

    const report = { ops: OPS, duration_s: duration, throughput_ops_s: Number(throughput.toFixed(2)), success: m.succeeded, failed: m.failed, retries: m.attempted - m.succeeded - m.failed, passes, error_rate: Number(errorRate.toFixed(4)) };
    fs.mkdirSync('reports', { recursive: true });
    fs.writeFileSync('reports/desktop_sync_load.json', JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));

    if (!(report.failed/OPS < 0.02)) process.exit(2);
  } finally {
    server.kill('SIGTERM');
  }
}

main().catch(e=>{ console.error(e); process.exit(1); });
