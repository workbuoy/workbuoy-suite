
const { app, Notification } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { ensureColumnsAndIndexes } = require('./db/bootstrap');
const log = require('./logger').create('bg');
const { fetch } = require('undici');
const conflicts = require('./conflict');
const roaming = require('./roaming');
const { start: otelStart, span } = require('./otel');
otelStart();
const pLimit = require('p-limit');
const {
  incSync, incSyncErr, incCacheWrites, incCacheConflicts,
  observeSyncDuration, incSyncPages, incRateLimited
} = require('./metrics');
const { getAuthContext } = require('./auth-bridge');
const Store = require('electron-store');
const store = new Store({ name: 'settings' });

const PORTAL_URL = process.env.WB_PORTAL_BASE_URL || 'https://app.workbuoy.com/portal';
const API_BASE = process.env.WB_API_BASE_URL || 'https://app.workbuoy.com/api';
const SYNC_INTERVAL_SEC_DEFAULT = parseInt(process.env.WB_SYNC_POLL_SEC || '300', 10);
const CRM_TABLES = ['deals','tickets','meetings'];
const PAGE_SIZE = Math.max(25, Math.min(500, parseInt(process.env.WB_SYNC_PAGE_SIZE || '100', 10)));
const CONCURRENCY = Math.max(1, Math.min(4, parseInt(process.env.WB_SYNC_CONCURRENCY || '2', 10)));

let db; let timer;

// -- DB helpers --
function dbPath() { return path.join(app.getPath('userData'), 'cache.sqlite'); }

function openDB() {
  db = new sqlite3.Database(dbPath());
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT)`);
    const tables = ['messages','customers','calendar','tasks'];
    for (const t of tables) {
      db.run(`CREATE TABLE IF NOT EXISTS ${t} (id TEXT PRIMARY KEY, updated_at INTEGER, payload TEXT)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_${t}_updated ON ${t}(updated_at)`);
    }
  });
  log.info('[bg] DB ready', dbPath());
}

function kvGet(key) {
  return new Promise((resolve) => {
    db.get(`SELECT v FROM kv WHERE k=?`, [key], (err, row) => resolve(row?.v || null));
  });
}
function kvSet(key, value) {
  return new Promise((resolve, reject) => {
    db.run(`INSERT OR REPLACE INTO kv (k, v) VALUES (?, ?)`, [key, String(value)], (err) => err ? reject(err) : resolve());
  });
}

function upsert(table, rows) {
  return new Promise((resolve, reject) => {
    if (!rows || rows.length === 0) return resolve({ conflicts:0, writes: 0 });
    const stmt = db.prepare(`INSERT OR REPLACE INTO ${table} (id, updated_at, payload) VALUES (?, ?, ?)`);
    let conflicts = 0; let writes = 0;
    db.serialize(() => {
      for (const r of rows) {
        try {
          stmt.run([r.id, r.updated_at || Date.now(), JSON.stringify(r)], (err) => {
            if (err) { conflicts++; } else { writes++; }
          });
        } catch { conflicts++; }
      }
      stmt.finalize((err) => err ? reject(err) : resolve({ conflicts, writes }));
    });
  });
}


function getUpdatedAt(table, id) {
  return new Promise((resolve) => {
    db.get(`SELECT updated_at FROM ${table} WHERE id=?`, [id], (err, row) => resolve(row?.updated_at || null));
  });
}
async function upsertCRM(table, rows) {
  let conflictsCount = 0, writes = 0;
  if (!rows || rows.length === 0) return { conflictsCount, writes };
  for (const r of rows) {
    const prev = await getUpdatedAt(table, r.id);
    const isConflict = prev && Number(prev) > Number(r.updated_at || Date.now());
    const payload = JSON.stringify({ ...r, conflicted: isConflict ? 1 : 0 });
    await new Promise((resolve) => {
      db.run(`INSERT OR REPLACE INTO ${table} (id, updated_at, payload, conflicted) VALUES (?, ?, ?, ?)`,
        [r.id, r.updated_at || Date.now(), payload, isConflict ? 1 : 0],
        () => resolve());
    });
    writes++;
    if (isConflict) conflictsCount++;
  }
  return { conflictsCount, writes };
}



// --- Queue helpers ---
function qInsert({ id, entity, entity_id, op, payload, qtype='crm' }) {
  return new Promise((resolve, reject) => {
    const now = Date.now();
    db.run(`INSERT INTO sync_queue (id, entity, entity_id, op, payload, created_at, updated_at, status, attempt, qtype) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 0, ?)`,
      [id, entity, entity_id||null, op, payload ? JSON.stringify(payload) : null, now, now, qtype],
      (err) => err ? reject(err) : resolve());
  });
}
function qList({ status, limit=50 }={}) {
  const args = []; let where = ''; if (status) { where = 'WHERE status=?'; args.push(status); }
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM sync_queue ${where} ORDER BY updated_at DESC LIMIT ?`, args.concat([Math.max(1, Math.min(200, Number(limit)))]), (err, rows) => {
      if (err) return reject(err); resolve(rows||[]);
    });
  });
}
function qUpdateStatus(id, status, last_error=null) {
  return new Promise((resolve, reject) => {
    db.run(`UPDATE sync_queue SET status=?, updated_at=?, attempt=CASE WHEN ? IS NULL THEN attempt ELSE attempt+1 END, last_error=? WHERE id=?`,
      [status, Date.now(), last_error ? 1: null, last_error, id], (err) => err ? reject(err) : resolve());
  });
}
function qDelete(id) {
  return new Promise((resolve, reject) => db.run('DELETE FROM sync_queue WHERE id=?', [id], (err)=> err?reject(err):resolve()));
}
function conflictSet(table, id, flag=1) {
  return new Promise((resolve) => db.run(`UPDATE ${table} SET conflicted=? WHERE id=?`, [flag, id], ()=> resolve()));
}
function conflictRecord({ entity, entity_id, resolved_by, resolution, note }) {
  return new Promise((resolve) => db.run(`INSERT OR REPLACE INTO conflict_resolutions (id, entity, entity_id, resolved_by, resolved_at, resolution, note) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [String(Date.now())+'-'+Math.random().toString(36).slice(2), entity, entity_id, resolved_by, Date.now(), resolution, note||null], ()=> resolve()));
}


function readTop(table, limit=10) {
  return new Promise((resolve, reject) => {
    db.all(`SELECT id, updated_at, payload FROM ${table} ORDER BY updated_at DESC LIMIT ?`, [limit], (err, rows) => {
      if (err) return reject(err);
      const out = rows.map(r => { try { return JSON.parse(r.payload); } catch { return { id: r.id, updated_at: r.updated_at }; } });
      resolve(out);
    });
  });
}

// -- Sync helpers --
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }


async function notifyCRM(kind, item) {
  const allowKey = 'crmNotify' + (kind.charAt(0).toUpperCase() + kind.slice(1));
  const allow = !!store.get(allowKey, true);
  if (!allow) return;
  try {
    const title = `CRM • ${kind}`;
    const body = item.title || item.name || item.subject || item.id || 'Oppdatert element';
    new Notification({ title, body: String(body).slice(0, 140) }).show();
    const { incCRMNotifications } = require('./metrics'); incCRMNotifications();
  } catch {}
}


async function fetchPaged({ endpoint, table, key }) {
  const auth = await getAuthContext({ portalUrl: PORTAL_URL, preferBearer: process.env.WB_PREFER_BEARER === '1' });
  let headers = {};
  if (auth.cookieHeader) headers['cookie'] = auth.cookieHeader;
  if (auth.bearer) headers['authorization'] = `Bearer ${auth.bearer}`;

  // ETag / If-Modified-Since
  const etagKey = `etag:${table}`;
  const imsKey = `ims:${table}`;
  const prevEtag = await kvGet(etagKey);
  const prevIMS = await kvGet(imsKey);
  if (prevEtag) headers['if-none-match'] = prevEtag;
  if (prevIMS) headers['if-modified-since'] = prevIMS;

  let next = null;
  let page = 0;
  do {
    const qs = new URLSearchParams({ limit: String(PAGE_SIZE) });
    if (next) qs.set('cursor', next);
    const url = `${API_BASE}${endpoint}?${qs.toString()}`;
    const start = Date.now();
    const res = await fetch(url, { headers, redirect: 'manual' });
    const ms = Date.now() - start;
    if (res.status === 304) {
      // not modified
      observeSyncDuration(ms, { endpoint, result: 'not_modified' });
      break;
    }
    if (res.status === 429) {
      incRateLimited();
      observeSyncDuration(ms, { endpoint, result: 'rate_limited' });
      await sleep(1000 + Math.random()*500);
      continue;
    }
    if (!res.ok) {
      observeSyncDuration(ms, { endpoint, result: 'error' });
      throw new Error(`HTTP ${res.status} for ${endpoint}`);
    }
    const etag = res.headers.get('etag');
    const lastMod = res.headers.get('last-modified');
    if (etag) await kvSet(etagKey, etag);
    if (lastMod) await kvSet(imsKey, lastMod);

    const data = await res.json();
    const list = Array.isArray(data) ? data : (data.items || data[key] || []);
    const cursor = data.nextCursor || data.next || null;

    let conflicts = 0, writes = 0;
    if (CRM_TABLES.includes(table)) {
      const resCRM = await upsertCRM(table, list);
      conflicts = resCRM.conflictsCount; writes = resCRM.writes;
      if (writes) {
        try { for (const it of list.slice(0, Math.min(3, list.length))) await notifyCRM(table.replace(/s$/,''), it); } catch {}
      }
    } else {
      const res = await upsert(table, list);
      conflicts = res.conflicts; writes = res.writes;
    }
    if (writes) incCacheWrites(writes);
    if (conflicts) { const { incOfflineConflicts } = require('./metrics'); incOfflineConflicts(conflicts); }
    if (conflicts) incCacheConflicts(conflicts);

    page++;
    incSyncPages();
    next = cursor;
    if (!next || list.length < PAGE_SIZE) break;
  } while (page < 100); // hard stop to avoid runaway
}

async function once() {
  incSync();
  const limit = pLimit(CONCURRENCY);
  const tasks = [
    limit(() => fetchPaged({ endpoint: '/messages', table: 'messages', key: 'messages' })),
    limit(() => fetchPaged({ endpoint: '/customers', table: 'customers', key: 'customers' })),
    limit(() => fetchPaged({ endpoint: '/calendar', table: 'calendar', key: 'events' })),
    limit(() => fetchPaged({ endpoint: '/tasks', table: 'tasks', key: 'tasks' })),
  ];
  try {
    await Promise.all(tasks);
  } catch (e) {
    incSyncErr();
    log.error('[bg] once error', e.message);
  }
}


async function enqueueWrite({ entity, op, entityId, payload }) {
  const id = (globalThis.crypto?.randomUUID?.() || (String(Date.now())+'-'+Math.random().toString(36).slice(2)));
  const entityMap = { deal:'deals', ticket:'tickets', task:'tasks', meeting:'meetings' };
  await qInsert({ id, entity, entity_id: entityId||null, op, payload });
  return { id };
}
async function listQueue(q) { return await qList(q||{}); }
async function retryQueue(id) { await qUpdateStatus(id, 'pending', null); }

async function resolveConflict({ entity, entityId, resolution }) {
  const table = ({ deal:'deals', ticket:'tickets', task:'tasks', meeting:'meetings' })[entity];
  if (!table) throw new Error('bad entity');
  // Apply resolution locally only; background flush will persist to server if keepLocal
  if (resolution === 'keepServer') {
    // Pull latest from server
    try {
      const auth = await getAuthContext({ portalUrl: PORTAL_URL, preferBearer: process.env.WB_PREFER_BEARER==='1' });
      const headers = {}; if (auth.cookieHeader) headers['cookie']=auth.cookieHeader; if (auth.bearer) headers['authorization']=`Bearer ${auth.bearer}`;
      const res = await fetch(`${API_BASE}/${table}/${encodeURIComponent(entityId)}`, { headers });
      if (res.ok) {
        const body = await res.json();
        await upsert(table, [{ id: body.id || entityId, updated_at: body.updated_at || Date.now(), ...body }]);
        await conflictSet(table, entityId, 0);
        const { incCRMConflictResolutions } = require('./metrics'); incCRMConflictResolutions();
        return { applied: 'server' };
      }
    } catch (e) { log.warn('[bg] resolve keepServer failed', e.message); }
  } else if (resolution === 'keepLocal') {
    // Read local row
    const rows = await new Promise((resolve) => db.all(`SELECT payload FROM ${table} WHERE id=?`, [entityId], (err, rows)=> resolve(rows||[])));
    const local = rows[0] && JSON.parse(rows[0].payload||'{}');
    if (local) {
      // enqueue local update to push to server
      await enqueueWrite({ entity, op:'update', entityId, payload: local });
      await conflictSet(table, entityId, 0);
      const { incCRMConflictResolutions } = require('./metrics'); incCRMConflictResolutions();
      return { applied: 'local_enqueued' };
    }
  }
  throw new Error('resolution failed');
}


function schedule(intervalSec) {
  if (timer) clearInterval(timer);
  const iv = Math.max(60, Math.min(3600, intervalSec || SYNC_INTERVAL_SEC_DEFAULT));
  timer = setInterval(once, iv * 1000);
  log.info('[bg] scheduled sync every', iv, 'sec');
}


async function processQueueOnce() {
  const items = await qList({ status: 'pending', limit: 25 });
  for (const it of items) {
    try {
      await qUpdateStatus(it.id, 'inflight', null);
      const auth = await getAuthContext({ portalUrl: PORTAL_URL, preferBearer: process.env.WB_PREFER_BEARER==='1' });
      const headers = { 'content-type': 'application/json' };
      if (auth.cookieHeader) headers['cookie']=auth.cookieHeader;
      if (auth.bearer) headers['authorization']=`Bearer ${auth.bearer}`;

      const qtype = String(it.qtype||'crm');
      if (qtype === 'email') {
        const base = process.env.WB_EMAIL_BASE_URL || (PORTAL_URL.replace('/portal','') + '/email');
        const res = await fetch(`${base}/drafts`, { method: 'POST', headers, body: JSON.stringify(JSON.parse(it.payload||'{}')) });
        if (!res.ok) throw new Error('EMAIL HTTP '+res.status);
        await qUpdateStatus(it.id, 'synced', null);
        continue;
      }
      if (qtype === 'calendar') {
        const base = process.env.WB_CAL_BASE_URL || (PORTAL_URL.replace('/portal','') + '/calendar');
        const res = await fetch(`${base}/events`, { method: 'POST', headers, body: JSON.stringify(JSON.parse(it.payload||'{}')) });
        if (!res.ok) throw new Error('CAL HTTP '+res.status);
        await qUpdateStatus(it.id, 'synced', null);
        continue;
      }
      const table = ({ deal:'deals', ticket:'tickets', task:'tasks', meeting:'meetings' })[it.entity];
      const urlBase = `${API_BASE}/${table}`;
      const opId = it.id;
      let url = urlBase, method = 'POST', body = null;
      if (it.op === 'create') { method = 'POST'; url = urlBase; body = it.payload ? it.payload : {}; }
      if (it.op === 'update') { method = 'PUT'; url = `${urlBase}/${encodeURIComponent(it.entity_id)}`; body = it.payload ? it.payload : {}; }
      if (it.op === 'delete') { method = 'DELETE'; url = `${urlBase}/${encodeURIComponent(it.entity_id)}`; }
      const res = await fetch(url, { method, headers, body: method==='DELETE' ? undefined : JSON.stringify({ ...JSON.parse(it.payload||'{}'), op_id: opId }) });
      if (res.status === 409 || res.status === 412) {
        // conflict
        await qUpdateStatus(it.id, 'failed', 'conflict');
        const { incOfflineConflicts } = require('./metrics'); incOfflineConflicts();
        await conflictSet(table, it.entity_id || (JSON.parse(it.payload||'{}').id), 1);
        continue;
      }
      if (!res.ok) throw new Error('HTTP '+res.status);
      await qUpdateStatus(it.id, 'synced', null);
      const { incCRMWrites } = require('./metrics'); incCRMWrites();
    } catch (e) {
      const attempts = (it.attempt||0) + 1;
      const backoff = Math.min(60_000, (2 ** attempts) * 1000) * (0.5 + Math.random());
      await qUpdateStatus(it.id, 'failed', e.message);
      // schedule retry
      setTimeout(()=> retryQueue(it.id).catch(()=>{}), backoff);
      log.warn('[bg] queue item failed', it.id, e.message);
    }
  }
}


function start({ intervalSec } = {}) {
  openDB();
  setTimeout(once, 10_000);
  schedule(intervalSec);
  setInterval(processQueueOnce, 30_000);
}

module.exports = { start, schedule, readTop };


// ===== Phase G additions (Cross-org & Workflow runner) =====
const cryptoLike = globalThis.crypto && globalThis.crypto.randomUUID ? globalThis.crypto : null;

// Extended enqueue supporting qtype/orgId/wf
async function enqueueWriteEx({ entity, op, entityId, payload, qtype='crm', orgId=null, wfId=null, stepIndex=0 }) {
  const id = (cryptoLike?.randomUUID?.() || (String(Date.now())+'-'+Math.random().toString(36).slice(2)));
  await qInsert({ id, entity, entity_id: entityId||null, op, payload, qtype, org_id: orgId, wf_id: wfId, step_index: stepIndex|0 });
  return { id };
}

// Enqueue a workflow manifest atomically
async function enqueueWorkflow(wf, wfId) {
  await new Promise((resolve)=> db.run('BEGIN', resolve));
  try {
    for (let i=0;i<(wf.steps||[]).length;i++) {
      const s = wf.steps[i]||{};
      const id = (cryptoLike?.randomUUID?.() || (String(Date.now())+'-'+Math.random().toString(36).slice(2)));
      // lock later steps initially as 'waiting' to ensure ordering
      const now = Date.now();
      await new Promise((resolve, reject) => {
        db.run(`INSERT INTO sync_queue (id, entity, entity_id, op, payload, created_at, updated_at, status, attempt, qtype, org_id, wf_id, step_index)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)`,
          [id, s.entity||null, s.entityId||null, s.op||null, s.payload?JSON.stringify(s.payload):null, now, now, (i===0?'pending':'waiting'), (s.qtype||'crm'), (wf.orgId||null), wfId, i],
          (err)=> err?reject(err):resolve());
      });
    }
    await new Promise((resolve)=> db.run('COMMIT', resolve));
  } catch (e) {
    await new Promise((resolve)=> db.run('ROLLBACK', resolve));
    throw e;
  }
}

// Unlock next steps when previous synced
function unlockWorkflowSteps() {
  db.each(`SELECT DISTINCT wf_id FROM sync_queue WHERE status IN ('waiting','pending') AND wf_id IS NOT NULL`, [], (err, row) => {
    if (err || !row?.wf_id) return;
    const wfId = row.wf_id;
    db.get(`SELECT MAX(step_index) as maxSynced FROM sync_queue WHERE wf_id=? AND status='synced'`, [wfId], (e2, r2) => {
      const maxSynced = Number(r2?.maxSynced ?? -1);
      db.run(`UPDATE sync_queue SET status='pending', updated_at=? WHERE wf_id=? AND step_index=? AND status='waiting'`, [Date.now(), wfId, maxSynced+1], ()=>{});
    });
  });
}
setInterval(unlockWorkflowSteps, 5000);

// Export new APIs
module.exports.enqueueWorkflow = enqueueWorkflow;
module.exports.enqueueWriteEx = enqueueWriteEx;
// ===== End Phase G additions =====


async function handleConflict(localRec, remoteRec) {
  const r = conflicts.resolve(localRec, remoteRec);
  if (r && r.winner === 'local') return { payload: r.value, apply: 'local' };
  return { payload: r.value, apply: 'remote' };
}


async function pushAudit(fetch, base, headers, entry) {
  try {
    const res = await fetch(`${base}/audit`, { method:'POST', headers: { 'content-type':'application/json', ...headers }, body: JSON.stringify(entry) });
    return res.ok;
  } catch { return false; }
}


/** ==== Audit Queue (persist + retry/backoff) ==== */
function ensureAuditTable(db) {
  return new Promise(res=> db.run(`CREATE TABLE IF NOT EXISTS audit_queue(
    id TEXT PRIMARY KEY, type TEXT, org_id TEXT, payload TEXT,
    status TEXT, attempt INTEGER, last_error TEXT,
    created_at INTEGER, updated_at INTEGER,
    earliest_at INTEGER DEFAULT 0)`, [], ()=> res()));
}
async function enqueueAudit(db, item) {
  await ensureAuditTable(db);
  return new Promise((res,rej)=> db.run(
    `INSERT OR REPLACE INTO audit_queue (id,type,org_id,payload,status,attempt,last_error,created_at,updated_at,earliest_at) VALUES (?,?,?,?, 'pending', COALESCE((SELECT attempt FROM audit_queue WHERE id=?),0), NULL, ?, ?)`,
    [item.id, item.type, item.org_id||null, sanitizeForAudit(item.payload||{}), item.id, Date.now(), Date.now(), 0],
    (e)=> e?rej(e):res()));
}
function listAudit(db, limit=50) {
  return new Promise((res)=> db.all(`SELECT * FROM audit_queue WHERE status IN ('pending','failed') AND (earliest_at IS NULL OR earliest_at<=?) ORDER BY updated_at LIMIT ?`, [limit], (e,rows)=> res(rows||[])));
}
function markAudit(db, id, status, err=null) {
  return new Promise((res)=> db.run(`UPDATE audit_queue SET status=?, attempt=attempt+?, last_error=?, updated_at=? WHERE id=?`,
    [status, status==='failed'?1:0, err, Date.now(), id], ()=> res()));
}
let isFlushingAudit=false;
async function flushAudit(db, fetch, baseUrl, headers, metrics) {
  if (isFlushingAudit) return; isFlushingAudit=true; try {
  await ensureAuditTable(db);
  const batch = await new Promise(r=> db.all(`SELECT * FROM audit_queue WHERE status IN ('pending','failed') AND (earliest_at IS NULL OR earliest_at<=?) ORDER BY updated_at LIMIT ?`, [Date.now(), 100], (e,rows)=> r(rows||[])));
  try { metrics?.setAuditQueueSize?.(batch.length); } catch {}
  for (const it of batch) {
    try {
      
      const r = await fetch(`${baseUrl}/audit`, { method:'POST', headers: { 'content-type':'application/json', ...(headers||{}) }, body: it.payload });
      if (r.ok) { await markAudit(db, it.id, 'synced'); try { metrics?.incAuditPush?.('success',1);} catch{} }
      else { await markAudit(db, it.id, 'failed', 'http_'+r.status); try { metrics?.incAuditPush?.('error',1);} catch{} }
    
    } catch (e) {
       await markAudit(db, it.id, 'failed', e.message); try { metrics?.incAuditPush?.('error',1);} catch{
    } finally {
      if (it.status!=='synced') {
        const base=1000, cap=60000; const jitter=Math.floor(Math.random()*base);
        const next = Math.min(cap, base * Math.pow(2, (it.attempt||0))) + jitter;
        await new Promise(r=> db.run(`UPDATE audit_queue SET earliest_at=? WHERE id=?`, [Date.now()+next, it.id], ()=> r()));
        try { require('./metrics').incAuditPush?.('retry',1);} catch{}
      }
    }
  }
  }
}
setInterval(()=> {
  try {
    if (!db) return;
    const base = process.env.WB_API_BASE_URL || '';
    if (!base) return;
    flushAudit(db, fetch, base, (globalThis.__authHeaders||{}), require('./metrics'));
  } catch {}
}, 7000);
/** ==== /Audit Queue ==== */


function sanitizeForAudit(obj) {
  try {
    const SENSITIVE_KEYS = ['authorization','set-cookie','email','phone','token','access_token','refresh_token'];
    function red(o) {
      if (!o || typeof o !== 'object') return o;
      const out = Array.isArray(o)? []: {};
      for (const k of Object.keys(o)) {
        if (SENSITIVE_KEYS.includes(k.toLowerCase())) out[k] = '[REDACTED]';
        else if (typeof o[k] === 'object') out[k] = red(o[k]);
        else out[k] = String(o[k]).replace(/bearer\s+[a-z0-9\._-]+/ig,'[REDACTED]');
      }
      return out;
    }
    return JSON.stringify(red(obj||{}));
  } catch { return JSON.stringify({}); }
}

  } finally { isFlushingAudit=false; }
}
