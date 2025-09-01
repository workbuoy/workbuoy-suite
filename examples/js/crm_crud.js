import fetch from 'node-fetch';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:45860';
const API_KEY = process.env.API_KEY || 'dev';
const TENANT_ID = process.env.TENANT_ID || 't1';

function headers(){
  return { 'content-type':'application/json', 'x-api-key': API_KEY, 'x-tenant-id': TENANT_ID, 'x-user-role':'admin' };
}

async function main(){
  // CREATE
  let res = await fetch(`${BASE_URL}/api/v1/crm/contacts`, { method:'POST', headers: headers(), body: JSON.stringify({ name:'Alice Example', email:'alice@example.com' }) });
  const created = await res.json();
  console.log('Created:', created);

  // UPDATE
  res = await fetch(`${BASE_URL}/api/v1/crm/contacts/${created.id}`, { method:'PATCH', headers: headers(), body: JSON.stringify({ phone:'+4712345678' }) });
  const updated = await res.json();
  console.log('Updated:', updated);

  // GET
  res = await fetch(`${BASE_URL}/api/v1/crm/contacts/${created.id}`, { headers: headers() });
  const got = await res.json();
  console.log('Fetched:', got);
}
main().catch(e=>{ console.error(e); process.exit(1); });
