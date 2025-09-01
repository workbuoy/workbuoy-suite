import fetch from 'node-fetch';
import { withIncrementalSync } from './base.js';
import { getState, setState } from '../db/state.js';

async function getToken(){
  const base = process.env.ION_BASE || 'https://ion.example.com';
  const id = process.env.ION_CLIENT_ID, secret = process.env.ION_CLIENT_SECRET;
  const r = await fetch(base.replace(/\/$/,'') + '/connect/token', { method:'POST', headers:{ 'content-type':'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type:'client_credentials', client_id:id, client_secret:secret, scope: process.env.ION_SCOPE||'' }) });
  const j = await r.json();
  return j.access_token;
}

async function odata(path, token, params={}){
  const url = new URL((process.env.ION_BASE||'https://ion.example.com').replace(/\/$/,'') + path);
  for(const [k,v] of Object.entries(params)) url.searchParams.set(k, v);
  const r = await fetch(url.toString(), { headers:{ 'Authorization': `Bearer ${token}`, 'Accept':'application/json' } });
  if(!r.ok){ const t = await r.text(); throw Object.assign(new Error('infor_http_'+r.status), { status:r.status, body:t }); }
  return r.json();
}

export async function sync_sales_orders({ tenant }){
  const name='Infor M3';
  return withIncrementalSync({
    tenant, name, sinceKey:'since',
    fetchPage: async ({ since, cursor })=>{
      const token = await getToken();
      const top = 100; const skip = parseInt(cursor||'0',10)||0;
      const filter = since ? `ChangedDateTime ge ${since}` : undefined;
      const data = await odata('/odata/SalesOrder', token, { '$top': String(top), '$skip': String(skip), ...(filter?{'$filter':filter}:{}) });
      const items = data.value || [];
      const last = items.length ? (items[items.length-1].ChangedDateTime || since) : since;
      return { items, hasMore: items.length===top, nextCursor: String(skip + items.length), nextSince: last };
    },
    pushItems: async (items)=>{},
    getState, setState
  });
}

export default { sync: sync_sales_orders };
