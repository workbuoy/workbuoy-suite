import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:45870';
const API_KEY = process.env.API_KEY || 'dev';
const TENANT_ID = process.env.TENANT_ID || 't1';
const CACHE_FILE = path.join(process.cwd(), '.wb_cache.json');

function headers(){
  return { 'content-type':'application/json', 'x-api-key': API_KEY, 'x-tenant-id': TENANT_ID, 'x-user-role':'admin' };
}

function loadQueue(){
  if (!fs.existsSync(CACHE_FILE)) return [];
  return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
}

function saveQueue(q){
  fs.writeFileSync(CACHE_FILE, JSON.stringify(q, null, 2));
}

async function enqueueCreateContact(payload){
  const q = loadQueue();
  q.push({ op:'create_contact', payload, ts: Date.now() });
  saveQueue(q);
}

async function syncOnce(){
  const q = loadQueue();
  const remaining = [];
  for (const item of q){
    try {
      if (item.op === 'create_contact'){
        const res = await fetch(`${BASE_URL}/api/v1/crm/contacts`, { method:'POST', headers: headers(), body: JSON.stringify(item.payload) });
        if (!res.ok) throw new Error('HTTP '+res.status);
      }
    } catch (e){
      remaining.push(item);
      continue;
    }
  }
  saveQueue(remaining);
  return { before: q.length, after: remaining.length };
}

async function main(){
  await enqueueCreateContact({ name:'E2E Offline User', email:'offline@e2e.local' });
  const rep = await syncOnce();
  console.log(JSON.stringify({ offline_enqueued: 1, sync_report: rep }));
}
main().catch(e=>{ console.error(e); process.exit(1); });
