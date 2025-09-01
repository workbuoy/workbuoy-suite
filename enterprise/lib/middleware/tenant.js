// Tenant middleware: resolveTenantId with hardening and precedence
import path from 'path';
import sqlite3 from 'sqlite3';
import { verifyToken } from '../auth.js';
import { WB_BASE_DOMAIN } from '../config/flags.js';

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');
const ALLOW_HEADER = (process.env.WB_ALLOW_TENANT_HEADER || 'false').toLowerCase() === 'true';

/** sanitize tenant id: [a-z0-9-], lowercase, max 64 */
export function sanitizeTenantId(id) {
  if (!id) return null;
  const v = String(id).toLowerCase().replace(/[^a-z0-9\-]/g, '');
  return v ? v.slice(0, 64) : null;
}

/** Extract subdomain tenant from Host header against WB_BASE_DOMAIN */
function tenantFromSubdomain(req) {
  const host = (req.headers['x-forwarded-host'] || req.headers.host || '').toString().toLowerCase();
  const base = (process.env.WB_BASE_DOMAIN || WB_BASE_DOMAIN || '').toString().toLowerCase().trim();
  if (!host || !base) return null;
  if (!(host === base || host.endsWith('.' + base))) return null;
  const sub = host === base ? null : host.slice(0, -1 * (base.length + 1));
  if (!sub) return null;
  const left = sub.split('.')[0];
  if (!left || left === 'www') return null;
  return sanitizeTenantId(left);
}

/** Resolve tenant id with strict precedence: JWT > subdomain > header > query */
export function resolveTenantId(req) {
  // 1) JWT
  let jwtTenant = null;
  const auth = (req.headers.authorization || '').toString();
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (m) {
    try {
      const payload = verifyToken(m[1]);
      if (payload && payload.tenant_id) jwtTenant = sanitizeTenantId(payload.tenant_id);
    } catch (_) {
      // ignore invalid token for tenant resolution
    }
  }
  if (jwtTenant) return jwtTenant;

  // 2) Subdomain
  const subTenant = tenantFromSubdomain(req);
  if (subTenant) return subTenant;

  // 3) Header (only if explicitly allowed)
  if (ALLOW_HEADER) {
    const h = req.headers['x-tenant'] || req.headers['x-tenant-id'];
    const t = sanitizeTenantId(h);
    if (t) return t;
  }

  // 4) Query
  const q = req.query || {};
  const t = sanitizeTenantId(q.tenant || q.t);
  if (t) return t;

  return null;
}

/** Express style guard to ensure req.tenant_id is present */
export function requireTenant(req, res, next) {
  const tid = resolveTenantId(req);
  if (!tid) {
    res.status(400).json({ error: 'missing_tenant' });
    return;
  }
  req.tenant_id = tid;
  next();
}

/** RBAC helper: checks user membership within tenant (sqlite variant kept for dev) */
export function requireRole(role = 'owner') {
  const level = { owner: 3, admin: 2, member: 1 };
  return function(req, res, next) {
    const tenant_id = req.tenant_id || resolveTenantId(req);
    if (!tenant_id) {
      res.status(400).json({ error: 'missing_tenant' });
      return;
    }
    const auth = (req.headers.authorization || '').toString();
    const m = auth.match(/^Bearer\s+(.+)$/i);
    if (!m) { res.status(401).json({ error: 'missing_token' }); return; }
    let user;
    try { user = verifyToken(m[1]); } catch { /* noop */ }
    if (!user) { res.status(401).json({ error: 'invalid_token' }); return; }

    const db = new sqlite3.Database(DB_PATH);
    db.get(`SELECT role FROM org_users WHERE tenant_id = ? AND user_email = ?`, [tenant_id, user.email], (err, row) => {
      db.close();
      if (err) { res.status(500).json({ error: 'db_error' }); return; }
      if (!row) { res.status(403).json({ error: 'forbidden' }); return; }
      if ((level[row.role] || 0) < (level[role] || 0)) { res.status(403).json({ error: 'forbidden' }); return; }
      req.user = user;
      req.tenant_id = tenant_id;
      next();
    });
  };
}

// TODO: increment wb_rbac_denied_total{tenant,route} metric on deny
