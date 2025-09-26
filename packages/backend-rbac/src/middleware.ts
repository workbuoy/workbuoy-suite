import type { NextFunction, Request, Response } from 'express';
import { decide } from './policy.js';
import { getAudit, getCounters, isEnforced, storeProxy } from './config.js';
import type {
  Action,
  ResourceKind,
  ResourceResolver,
  Role,
} from './types.js';

function normalizeList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

export function createPolicyEnforcer(
  action: Action,
  resourceKind: ResourceKind,
  resolveResource?: ResourceResolver,
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!isEnforced() && req.method === 'GET') {
      return next();
    }

    const tenant_id = String((req as any).tenant_id ?? req.header('x-tenant-id') ?? 'demo-tenant');
    const user_id = ((req as any).actor_user_id ?? req.header('x-user-id') ?? null) as string | null;
    const groups = normalizeList((req as any).groups ?? req.header('x-groups'));
    const roles = normalizeList((req as any).roles ?? req.header('x-roles')) as Role[];

    const subject = { tenant_id, user_id, groups, roles };
    const resourceInput =
      typeof resolveResource === 'function'
        ? await resolveResource(req)
        : resolveResource;
    const resource = resourceInput ?? {};

    const decision = await decide(storeProxy, subject, action, {
      kind: resourceKind,
      id: resource?.id ?? null,
      owner_id: resource?.owner_id ?? null,
    });

    if (!decision.allow) {
      getCounters().denied.inc();
      const audit = getAudit();
      if (audit) {
        await audit({
          type: 'rbac.denied',
          tenant_id,
          actor_id: user_id,
          details: {
            action,
            resourceKind,
            resource,
            reason: decision.reason,
          },
        });
      }
      return res.status(403).json({ error: 'Forbidden', reason: decision.reason });
    }

    return next();
  };
}

export function requireRole(min: Extract<Role, 'viewer' | 'contributor' | 'manager' | 'admin'>) {
  const order = ['viewer', 'contributor', 'manager', 'admin'] as const;
  return (req: Request, res: Response, next: NextFunction) => {
    if (!isEnforced()) {
      return next();
    }
    const roles = normalizeList((req as any).roles ?? req.header('x-roles')) as Role[];
    if (roles.length === 0) {
      roles.push('viewer');
    }
    const ok = roles.some((role) => order.indexOf(role as any) >= order.indexOf(min));
    if (!ok) {
      getCounters().denied.inc();
      return res.status(403).json({ error: 'Forbidden', reason: 'role-insufficient' });
    }
    return next();
  };
}

export function requireFeature(featureFlag: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!isEnforced()) {
      return next();
    }
    const featureSources = [
      (req as any).features,
      (req as any).featureFlags,
      req.header('x-features'),
      req.header('x-feature-flags'),
    ];
    const features = new Set(featureSources.flatMap((value) => normalizeList(value)));
    if (!features.has(featureFlag)) {
      return res.status(403).json({ error: 'Forbidden', reason: 'feature-disabled', feature: featureFlag });
    }
    return next();
  };
}
