import { Router } from 'express';
import {
  getSubscriptionForTenant,
  getSubscriptionCap,
  setSubscriptionForTenant,
  ensureSubscriptionHydrated,
} from '../../src/core/subscription/state';
import { isSubscriptionPlan } from '../../src/core/subscription/entitlements';
import { parseProactivityMode } from '../../src/core/proactivity/modes';

const router: any = Router();

function tenantFrom(req: any) {
  return String(req.header('x-tenant') || req.header('x-tenant-id') || req.query?.tenant || 'demo');
}

function requireAdmin(req: any, res: any, next: any) {
  const roles = String(req.header('x-roles') || req.header('x-role') || '')
    .split(',')
    .map((r: string) => r.trim())
    .filter(Boolean);
  if (!roles.includes('admin')) {
    return res.status(403).json({ error: 'admin_required' });
  }
  return next();
}

async function serialize(tenantId: string) {
  await ensureSubscriptionHydrated(tenantId);
  const current = getSubscriptionForTenant(tenantId);
  const cap = getSubscriptionCap(tenantId);
  return {
    tenantId,
    plan: current.plan,
    killSwitch: Boolean(current.killSwitch),
    secureTenant: Boolean(current.secureTenant),
    maxMode: cap.maxMode,
    maxOverride: current.maxOverride ?? null,
  };
}

router.get('/admin/subscription', requireAdmin, async (req: any, res: any) => {
  const tenantId = tenantFrom(req);
  const payload = await serialize(tenantId);
  res.json(payload);
});

router.put('/admin/subscription', requireAdmin, async (req: any, res: any) => {
  const tenantId = tenantFrom(req);
  const { plan, killSwitch, secureTenant, maxOverride } = req.body || {};
  const overrideValue = maxOverride === null ? undefined : maxOverride;

  if (plan && !isSubscriptionPlan(plan)) {
    return res.status(400).json({ error: 'invalid_plan' });
  }

  const next = await setSubscriptionForTenant(tenantId, {
    plan: plan ?? undefined,
    killSwitch: typeof killSwitch === 'boolean' ? killSwitch : undefined,
    secureTenant: typeof secureTenant === 'boolean' ? secureTenant : undefined,
    maxOverride: overrideValue !== undefined ? parseProactivityMode(overrideValue) : undefined,
  });

  const payload = await serialize(tenantId);
  res.json({ ...payload, plan: next.plan });
});

export default router;
