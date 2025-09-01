'use strict';
const fetch = require('node-fetch');
const { getSecret } = require('../config/secrets');
const { appendAudit } = require('../secure/audit');
const metrics = require('../metrics/registry');
const { getState, setState } = require('../db/state');
const { filterIncremental } = require('./incremental');

async function sync(tenant){
  const name = 'ServiceNow';
  const labels = { connector: name, tenant };
  metrics.counters.connector_sync_total.inc(labels);
  const sinceKey = 'since';
  const maxPerPage = 200;
  try {
    const secret = await getSecret(process.env['SERVICENOW_SECRET'] || `${tenant}:SERVICENOW_SECRET`);
    let since = await getState(tenant, name, sinceKey);
    let items = [];
    // Placeholder fetch with pagination/backoff (replace with real endpoint flow)
    let page = 1;
    while (page <= 1){ // extend when real API paging is wired
      const url = 'https://{tenant}.service-now.com/api/now/table/incident?sysparm_limit=100'.replace('{tenant}', tenant);
      const headers = { 'Accept': 'application/json', 'Authorization': 'Basic ' + Buffer.from(secret.username+':'+(secret.password||secret.token)).toString('base64') };
      const r = await fetch(url, { headers });
      if (r.status >= 500) throw new Error(`${name} 5xx`);
      if (!r.ok) throw new Error(`${name} http ${r.status}`);
      const data = await r.json();
      const arr = Array.isArray(data) ? data : (data.items || data.value || data.result || []);
      const inc = filterIncremental(arr, since, 'sys_updated_on');
      items = items.concat(inc);
      break;
    }
    await appendAudit({ type:'connector_sync', connector: name, tenant, count: items.length });
    const maxTs = items.reduce((m,it)=>{ const v = it['sys_updated_on']||it['updated_at']||it['lastModifiedDateTime']; const t = typeof v==='number'? v : Date.parse(v); return isNaN(t)? m : Math.max(m,t); }, since||0);
    await setState(tenant, name, maxTs || Date.now(), sinceKey);
    metrics.counters.connector_sync_success?.inc?.(labels);
    return { ok:true, count: items.length };
  } catch (e){
    metrics.counters.connector_err_total.inc(labels);
    metrics.counters.connector_sync_failure?.inc?.(labels);
    await appendAudit({ type:'connector_error', connector:'ServiceNow', tenant, error: String(e.message||e) });
    return { ok:false, error:String(e.message||e) };
  }
}

module.exports = { name: 'ServiceNow', sync };
