// Simulate SF and Dynamics connectors pushing to CRM
import fetch from 'node-fetch';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:45870';
const API_KEY = process.env.API_KEY || 'dev';
const TENANT_ID = process.env.TENANT_ID || 't1';

function headers(connector){
  return { 'content-type':'application/json', 'x-api-key': API_KEY, 'x-tenant-id': TENANT_ID, 'x-user-role':'admin', 'x-connector': connector };
}

async function pushContact(connector, idx){
  const res = await fetch(`${BASE_URL}/api/v1/crm/contacts`, {
    method:'POST', headers: headers(connector),
    body: JSON.stringify({ name:`${connector}-contact-${idx}`, email:`${connector}${idx}@example.com` })
  });
  return res.ok;
}

async function pushOpportunity(connector, idx){
  const res = await fetch(`${BASE_URL}/api/v1/crm/opportunities`, {
    method:'POST', headers: headers(connector),
    body: JSON.stringify({ title:`${connector}-opp-${idx}`, amount: 1000 + idx })
  });
  return res.ok;
}

async function main(){
  let ok=0;
  for (let i=0;i<3;i++){
    ok += (await pushContact('salesforce', i))?1:0;
  }
  for (let i=0;i<2;i++){
    ok += (await pushOpportunity('salesforce', i))?1:0;
  }
  for (let i=0;i<2;i++){
    ok += (await pushContact('dynamics', i))?1:0;
  }
  for (let i=0;i<1;i++){
    ok += (await pushOpportunity('dynamics', i))?1:0;
  }
  const m = await (await fetch(`${BASE_URL}/metrics`)).text();
  console.log('[metrics]\n'+m);
  console.log(JSON.stringify({ pushed_ok: ok }));
}
main().catch(e=>{ console.error(e); process.exit(1); });
