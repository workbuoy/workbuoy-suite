import { Router } from 'express';
import { getSubscriptionForTenant, getSubscriptionCap, setSubscriptionForTenant } from '../../src/core/subscription/state';
import { isSubscriptionPlan } from '../../src/core/subscription/entitlements';
import { parseProactivityMode } from '../../src/core/proactivity/modes';

const router: any = Router();

function tenantFrom(req: any) {
  return String(req.header('x-tenant') || req.header('x-tenant-id') || req.query?.tenant || 'demo');
}

function serialize(tenantId: string) {
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

router.get('/admin/subscription', (req: any, res: any) => {
  const tenantId = tenantFrom(req);
  res.json(serialize(tenantId));
});

router.put('/admin/subscription', (req: any, res: any) => {
  const tenantId = tenantFrom(req);
  const { plan, killSwitch, secureTenant, maxOverride } = req.body || {};
  const overrideValue = maxOverride === null ? undefined : maxOverride;

  if (plan && !isSubscriptionPlan(plan)) {
    return res.status(400).json({ error: 'invalid_plan' });
  }

  const next = setSubscriptionForTenant(tenantId, {
    plan: plan ?? undefined,
    killSwitch: typeof killSwitch === 'boolean' ? killSwitch : undefined,
    secureTenant: typeof secureTenant === 'boolean' ? secureTenant : undefined,
    maxOverride: overrideValue !== undefined ? parseProactivityMode(overrideValue) : undefined,
  });

  res.json({ ...serialize(tenantId), plan: next.plan });
});

export default router;
