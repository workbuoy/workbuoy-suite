import fetch from 'node-fetch';
import { withIncrementalSync } from './base.js';
import { getState, setState } from '../db/state.js';

async function wdFetch(path, params={}){
  const base = process.env.WORKDAY_BASE || 'https://wd.example.com';
  const token = process.env.WORKDAY_TOKEN || '';
  const url = new URL(base.replace(/\/$/,'') + path);
  for(const [k,v] of Object.entries(params)) if(v!=null) url.searchParams.set(k, v);
  const r = await fetch(url.toString(), { headers:{ 'Authorization': `Bearer ${token}`, 'Accept':'application/json' } });
  if(!r.ok){ const t = await r.text(); throw Object.assign(new Error('workday_http_'+r.status), { status:r.status, body:t }); }
  return r.json();
}

export async function sync_workers({ tenant }){
  const name='Workday';
  return withIncrementalSync({
    tenant, name, sinceKey:'since',
    fetchPage: async ({ since, cursor })=>{
      const top = 200; const page = parseInt(cursor||'0',10)||0;
      const data = await wdFetch('/raas/workers', { page: String(page), count: String(top), ...(since?{ since }:{}) });
      const items = data.items || data.value || [];
      const hasMore = items.length===top;
      const last = items.length ? (items[items.length-1].updated || since) : since;
      return { items, hasMore, nextCursor: String(page + 1), nextSince: last };
    },
    pushItems: async (items)=>{},
    getState, setState
  });
}

export default { sync: sync_workers };
