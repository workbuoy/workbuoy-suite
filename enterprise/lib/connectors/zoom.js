const { filterIncremental } = require('./incremental');
'use strict';
const fetch = require('node-fetch');
const { getSecret } = require('../config/secrets');
const { appendAudit } = require('../secure/audit');
const metrics = require('../metrics/registry');
const { getState, setState } = require('../db/state');

async function sync_zoom(tenant){
  const name = 'Zoom';
  const labels = { connector: name, tenant: tenant };
  metrics.counters.connector_sync_total.inc(labels);
  const sinceKey = 'since';
  try {
    const secret = await getSecret(process.env['ZOOM_SECRET'] || `${tenant}:ZOOM_SECRET`);
    let since = await getState(tenant, name, sinceKey);
    const items = [];
    // === FETCH STUB: replace with real endpoints ===
    const url = 'https://api.zoom.us/v2/users/me/meetings';
    const r = await fetch(url, { headers: { 'Authorization': 'Bearer ' + (secret.token||secret), 'Accept': 'application/json' } });
    if (!r.ok) throw new Error(`${name} http ${r.status}`);
    const data = await r.json();
    // Collect / filter incrementally if "since" exists
    let rawItems = (data.items || data.results || data || []);
    rawItems = Array.isArray(rawItems) ? rawItems : (rawItems.value || []);
    const itemsInc = filterIncremental(rawItems, since, 'start_time');
    for (const it of itemsInc) {
      items.push(it);
    }
    await appendAudit({ type: 'connector_sync', connector: name, tenant, count: items.length });
    const maxTs = itemsInc.reduce((m,it)=>{ const v = it['start_time']||it['updated_at']||it['lastModifiedDateTime']; const t = typeof v==='number'? v : Date.parse(v); return isNaN(t)? m : Math.max(m,t); }, since||0);
    await setState(tenant, name, maxTs || Date.now(), sinceKey);
    metrics.counters.connector_sync_success.inc(labels);
    return { ok: true, count: items.length };
  } catch (e){
    metrics.counters.connector_err_total.inc(labels);
    metrics.counters.connector_sync_failure?.inc?.(labels);
    await appendAudit({ type: 'connector_error', connector: 'Zoom', tenant, error: String(e.message||e) });
    return { ok: false, error: String(e.message||e) };
  }
}

module.exports = { name: 'Zoom', sync: sync_zoom };
