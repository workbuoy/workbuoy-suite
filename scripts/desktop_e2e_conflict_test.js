import { spawn } from 'child_process';
import { SyncEngine } from './sync_lib.js';
import fs from 'fs';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:45890';

function wait(ms){ return new Promise(r=>setTimeout(r,ms)); }

async function startServer(){
  const ps = spawn(process.execPath, ['scripts/mock_crm_api_conflict.js'], { stdio: 'inherit' });
  await wait(500);
  return ps;
}

async function main(){
  const server = await startServer();
  try{
    // Enqueue a record that collides with remote (same id)
    const engine = new SyncEngine({ baseUrl: BASE_URL, headers: ()=>({'content-type':'application/json'}) , mergePolicy: process.env.MERGE_POLICY || 'lww' });
    const local = { id:'conflict-1', name:'Local Contact', email:'local@example.com', updated_at: Date.now() + (process.env.LWW_LOCAL_AHEAD? 1000 : -1000) };
    await engine.enqueueCreateContact(local);

    const t0 = Date.now();
    const rep = await engine.syncOnce();
    const t1 = Date.now();

    // fetch final remote
    const res = await fetch(`${BASE_URL}/_admin/contacts/conflict-1`);
    const final = await res.json();

    const lww = engine.mergePolicy === 'lww';
    const expectedName = lww
      ? (local.updated_at > final.updated_at ? 'Local Contact' : final.name)
      : 'Local Contact'; // merge should take local fields

    const outcome = {
      policy: engine.mergePolicy,
      took_ms: t1 - t0,
      sync_report: rep,
      final_remote: final
    };

    fs.mkdirSync('reports', { recursive: true });
    fs.writeFileSync('reports/desktop_conflict.json', JSON.stringify(outcome, null, 2));
    console.log(JSON.stringify(outcome, null, 2));
  } finally {
    server.kill('SIGTERM');
  }
}

main().catch(e=>{ console.error(e); process.exit(1); });
