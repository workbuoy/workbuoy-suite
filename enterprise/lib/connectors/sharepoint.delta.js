import fetch from 'node-fetch';
import { getState, setState } from '../db/state.js';
import { appendAudit } from '../audit/store.js';

/**
 * Drive delta sync using Microsoft Graph
 * Persists @odata.deltaLink as cursor
 */
export async function sync_sharepoint_delta(tenant){
  const name='SharePoint';
  const token = process.env.MS_GRAPH_TOKEN || '';
  const driveId = process.env.SP_DRIVE_ID || 'me';
  let cursor = await getState(tenant, name, 'cursor');
  let url = cursor || `https://graph.microsoft.com/v1.0/${driveId}/drive/root/delta`;
  let total=0, lastLink=null;
  while(url){
    const r = await fetch(url, { headers:{ 'Authorization': `Bearer ${token}`, 'Accept':'application/json' } });
    if(!r.ok){ const t=await r.text(); throw new Error('sharepoint_http_'+r.status+':'+t); }
    const j = await r.json();
    const items = j.value || [];
    // upsert items...
    total += items.length;
    url = j['@odata.nextLink'] || null;
    lastLink = j['@odata.deltaLink'] || lastLink;
  }
  if(lastLink) await setState(tenant, name, lastLink, 'cursor');
  await appendAudit({ tenant_id: tenant, action:'connector_sync', target:name, details:{ total, cursor: lastLink? 'delta' : 'none' } });
  return { ok:true, total };
}
export default { sync: sync_sharepoint_delta };
