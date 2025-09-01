const { filterIncremental } = require('./incremental');
'use strict';
const fetch = require('node-fetch');
const { getSecret } = require('../config/secrets');
const { appendAudit } = require('../secure/audit');
const metrics = require('../metrics/registry');
const { getState, setState } = require('../db/state');

async function sync_qlik_sense(tenant){
  const name = 'Qlik Sense';
  const labels = { connector: name, tenant: tenant };
  metrics.counters.connector_sync_total.inc(labels);
  const sinceKey = 'since';
  try {
    const secret = await getSecret(process.env['QLIK_SENSE_SECRET'] || `${tenant}:QLIK_SENSE_SECRET`);
    let since = await getState(tenant, name, sinceKey);
    const items = [];
    // === FETCH STUB: replace with real endpoints ===
    const url = 'https://{tenant}.qlikcloud.com/api/v1/items';
    const r = await fetch(url, { headers: { 'Authorization': 'Bearer ' + (secret.token||secret), 'Accept': 'application/json' } });
    if (!r.ok) throw new Error(`${name} http ${r.status}`);
    const data = await r.json();
    // Collect / filter incrementally if "since" exists
    let rawItems = (data.items || data.results || data || []);
    rawItems = Array.isArray(rawItems) ? rawItems : (rawItems.value || []);
    const itemsInc = filterIncremental(rawItems, since, 'modifiedDate');
    for (const it of itemsInc) {
      items.push(it);
    }
    await appendAudit({ type: 'connector_sync', connector: name, tenant, count: items.length });
    const maxTs = itemsInc.reduce((m,it)=>{ const v = it['modifiedDate']||it['updated_at']||it['lastModifiedDateTime']; const t = typeof v==='number'? v : Date.parse(v); return isNaN(t)? m : Math.max(m,t); }, since||0);
    await setState(tenant, name, maxTs || Date.now(), sinceKey);
    metrics.counters.connector_sync_success.inc(labels);
    return { ok: true, count: items.length };
  } catch (e){
    metrics.counters.connector_err_total.inc(labels);
    metrics.counters.connector_sync_failure?.inc?.(labels);
    await appendAudit({ type: 'connector_error', connector: 'Qlik Sense', tenant, error: String(e.message||e) });
    return { ok: false, error: String(e.message||e) };
  }
}

module.exports = { name: 'Qlik Sense', sync: sync_qlik_sense };
