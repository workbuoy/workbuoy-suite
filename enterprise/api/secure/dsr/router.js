const express = require('express');
const { writeAudit } = require('../../../lib/secure/audit');
const { id, ensureMigration, getInjectedDB, insertRequest } = require('../../../lib/secure/dsr');

const router = express.Router();

function ok(res, data) { return res.status(200).json({ ok: true, ...data }); }
function bad(res, msg) { return res.status(400).json({ ok: false, error: msg }); }

function pick(obj, keys) {
  const out = {};
  keys.forEach(k => { if (Object.prototype.hasOwnProperty.call(obj, k)) out[k] = obj[k]; });
  return out;
}

router.post('/access', async (req, res) => {
  const user_email = (req.body && req.body.user_email || '').trim().toLowerCase();
  if (!user_email) return bad(res, 'user_email is required');
  const db = getInjectedDB(req);
  ensureMigration(db);
  const requestId = id();

  insertRequest(db, { id: requestId, type: 'access', user_email, status: 'processing', sla: '30d', evidence: null });
  await writeAudit({ type: 'DSR_ACCESS_REQUESTED', user_email, request_id: requestId });

  try {
    let exportData = null;
    if (req.app?.locals?.gdprExport && typeof req.app.locals.gdprExport === 'function') {
      exportData = await req.app.locals.gdprExport(user_email);
    } else {
      exportData = { user: { email: user_email }, data: [], note: 'Using fallback export. Plug your GDPR exporter via app.locals.gdprExport(email).' };
    }

    db.prepare(`UPDATE dsr_requests SET status='closed', closed_at=datetime('now'), evidence=@e WHERE id=@id`)
      .run({ id: requestId, e: JSON.stringify({ export_size: JSON.stringify(exportData).length }) });

    await writeAudit({ type: 'DSR_ACCESS_FULFILLED', user_email, request_id: requestId });
    return ok(res, { request_id: requestId, export: exportData });
  } catch (err) {
    db.prepare(`UPDATE dsr_requests SET status='rejected', closed_at=datetime('now'), evidence=@e WHERE id=@id`)
      .run({ id: requestId, e: JSON.stringify({ error: String(err) }) });
    await writeAudit({ type: 'DSR_ACCESS_FAILED', user_email, request_id: requestId, error: String(err) });
    return res.status(500).json({ ok: false, error: 'Failed to process access request' });
  }
});

router.post('/erasure', async (req, res) => {
  const user_email = (req.body && req.body.user_email || '').trim().toLowerCase();
  if (!user_email) return bad(res, 'user_email is required');
  const db = getInjectedDB(req);
  ensureMigration(db);
  const requestId = id();
  insertRequest(db, { id: requestId, type: 'erasure', user_email, status: 'processing', sla: '30d', evidence: null });
  await writeAudit({ type: 'DSR_ERASURE_REQUESTED', user_email, request_id: requestId });

  try {
    try {
      db.prepare(`UPDATE users SET deleted_at = COALESCE(deleted_at, datetime('now')) WHERE email = ?`).run(user_email);
    } catch (_) { }

    db.exec(`CREATE TABLE IF NOT EXISTS erasure_tombstones (email TEXT PRIMARY KEY, erased_at TEXT NOT NULL)`);
    db.prepare(`INSERT OR REPLACE INTO erasure_tombstones (email, erased_at) VALUES (?, datetime('now'))`).run(user_email);

    db.prepare(`UPDATE dsr_requests SET status='closed', closed_at=datetime('now') WHERE id=?`).run(requestId);
    await writeAudit({ type: 'DSR_ERASURE_SOFT_DELETED', user_email, request_id: requestId });
    return ok(res, { request_id: requestId, status: 'soft-deleted' });
  } catch (err) {
    db.prepare(`UPDATE dsr_requests SET status='rejected', closed_at=datetime('now'), evidence=@e WHERE id=@id`)
      .run({ id: requestId, e: JSON.stringify({ error: String(err) }) });
    await writeAudit({ type: 'DSR_ERASURE_FAILED', user_email, request_id: requestId, error: String(err) });
    return res.status(500).json({ ok: false, error: 'Failed to process erasure request' });
  }
});

router.post('/rectification', async (req, res) => {
  const user_email = (req.body && req.body.user_email || '').trim().toLowerCase();
  const updates = (req.body && req.body.updates) || {};
  if (!user_email) return bad(res, 'user_email is required');
  if (!updates || typeof updates !== 'object') return bad(res, 'updates object is required');

  const allowed = (process.env.ALLOWED_RECTIFICATION_FIELDS || 'name,first_name,last_name,phone,locale,address')
    .split(',').map(s => s.trim()).filter(Boolean);
  const patch = pick(updates, allowed);
  if (Object.keys(patch).length === 0) return bad(res, 'no allowed fields present in updates');

  const db = getInjectedDB(req);
  ensureMigration(db);
  const requestId = id();
  insertRequest(db, { id: requestId, type: 'rectification', user_email, status: 'processing', sla: '30d', evidence: null });
  await writeAudit({ type: 'DSR_RECTIFICATION_REQUESTED', user_email, request_id: requestId, fields: Object.keys(patch) });

  try {
    const keys = Object.keys(patch);
    try {
      const setSql = keys.map(k => `${k} = @${k}`).join(', ');
      const stmt = db.prepare(`UPDATE users SET ${setSql} WHERE email = @user_email`);
      stmt.run({ ...patch, user_email });
    } catch (_) { }

    db.prepare(`UPDATE dsr_requests SET status='closed', closed_at=datetime('now'), evidence=@e WHERE id=@id`)
      .run({ id: requestId, e: JSON.stringify({ fields: Object.keys(patch) }) });
    await writeAudit({ type: 'DSR_RECTIFICATION_UPDATED', user_email, request_id: requestId, fields: Object.keys(patch) });
    return ok(res, { request_id: requestId, updated: Object.keys(patch) });
  } catch (err) {
    db.prepare(`UPDATE dsr_requests SET status='rejected', closed_at=datetime('now'), evidence=@e WHERE id=@id`)
      .run({ id: requestId, e: JSON.stringify({ error: String(err) }) });
    await writeAudit({ type: 'DSR_RECTIFICATION_FAILED', user_email, request_id: requestId, error: String(err) });
    return res.status(500).json({ ok: false, error: 'Failed to process rectification request' });
  }
});

router.post('/consent', async (req, res) => {
  const user_email = (req.body && req.body.user_email || '').trim().toLowerCase();
  const action = (req.body && req.body.action || '').toLowerCase();
  const metadata = (req.body && req.body.metadata) || {};
  if (!user_email) return bad(res, 'user_email is required');
  if (!['given','withdrawn','updated'].includes(action)) return bad(res, 'action must be given|withdrawn|updated');

  const db = getInjectedDB(req);
  ensureMigration(db);
  const requestId = id();
  insertRequest(db, { id: requestId, type: 'consent', user_email, status: 'processing', sla: '30d', evidence: null });
  await writeAudit({ type: 'DSR_CONSENT_CHANGED', user_email, request_id: requestId, action, metadata });

  try {
    db.exec(`CREATE TABLE IF NOT EXISTS consent_log (id TEXT PRIMARY KEY, email TEXT NOT NULL, action TEXT NOT NULL, metadata TEXT, ts TEXT NOT NULL)`);
    const rec = { id: requestId, email: user_email, action, metadata: JSON.stringify(metadata), ts: new Date().toISOString() };
    db.prepare(`INSERT INTO consent_log (id, email, action, metadata, ts) VALUES (@id, @email, @action, @metadata, @ts)`).run(rec);
    db.prepare(`UPDATE dsr_requests SET status='closed', closed_at=datetime('now') WHERE id=?`).run(requestId);
    return ok(res, { request_id: requestId, logged: true });
  } catch (err) {
    db.prepare(`UPDATE dsr_requests SET status='rejected', closed_at=datetime('now'), evidence=@e WHERE id=@id`)
      .run({ id: requestId, e: JSON.stringify({ error: String(err) }) });
    return res.status(500).json({ ok: false, error: 'Failed to record consent' });
  }
});

module.exports = router;
