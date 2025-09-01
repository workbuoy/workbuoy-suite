import { Request, Response, NextFunction } from 'express';
import { decide, MemoryStore, Store, Action, ResourceKind } from './policy.js';
import { rbac_denied_total } from '../metrics/metrics.js';
import { audit } from '../audit/log.js';

const ENFORCE = (process.env.RBAC_ENFORCE || 'true') === 'true';
export const store: Store = new MemoryStore(); // can be swapped for DB-backed in real env

export function enforce(action: Action, resourceKind: ResourceKind, resolveResource?: (req: Request)=>Promise<{ id?: string|null; owner_id?: string|null }>|{ id?: string|null; owner_id?: string|null }) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!ENFORCE && req.method === 'GET') return next();
    const tenant_id = String((req as any).tenant_id || req.header('x-tenant-id') || 'demo-tenant');
    const user_id = (req as any).actor_user_id || req.header('x-user-id') || null;
    const groups = ((req as any).groups || String(req.header('x-groups')||'').split(',').filter(Boolean)) as string[];
    const roles = ((req as any).roles || String(req.header('x-roles')||'').split(',').filter(Boolean)) as any[];
    const sub = { tenant_id, user_id, groups, roles };

    const resource = resolveResource ? await (typeof resolveResource === 'function' ? resolveResource(req) : resolveResource) : {};
    const decision = await decide(store, sub, action, { kind: resourceKind, ...(resource || {}) });

    if (!decision.allow) {
      rbac_denied_total.inc();
      audit({ type: 'rbac.denied', tenant_id, actor_id: user_id, details: { action, resourceKind, resource, reason: decision.reason } });
      return res.status(403).json({ error: 'Forbidden', reason: decision.reason });
    }
    next();
  };
}
