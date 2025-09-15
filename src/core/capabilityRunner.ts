import { policyCheck } from './policy';
import { logIntent } from './intentLog';
import { ENV } from './env';
import type { Autonomy, ModuleMode, PolicyResponse } from './types';

/**
 * Capability runner that respects autonomy levels (1..6), kill-switch and degraded modes.
 * L<=4 never executes side-effects (suggest/prepare only). L5 executes with fallback to prepare.
 * L6 executes or uses overlay when API is missing.
 */
export async function runCapability<T>(
  capabilityId: string,
  payload: any,
  ctx: { autonomy_level: Autonomy; tenantId: string; role: string },
  impl: {
    observe?: () => Promise<void>,
    suggest?: () => Promise<T>,
    prepare?: () => Promise<T>,
    execute?: () => Promise<T>,
    overlay?: () => Promise<T>,
    rollback?: (outcome: T) => Promise<void>,
  }
): Promise<{ outcome?: T; policy: PolicyResponse; mode: ModuleMode }> {
  // Global / tenant kill-switch
  if (ENV.KILL_SWITCH_ALL || ENV.isTenantKillSwitch(ctx.tenantId)) {
    const policy: PolicyResponse = { allowed: false, explanation: 'kill switch active', basis: ['ops:killswitch'] };
    await logIntent({ tenantId: ctx.tenantId, capability: capabilityId, payload: redact(payload), policy, mode: 'simulate' });
    return { policy, mode: 'simulate' };
  }

  const policy = await policyCheck({ capability: capabilityId, payload }, ctx);
  const mode: ModuleMode = ctx.autonomy_level >= 5 ? 'integration' : 'simulate';
  let outcome: any;

  if (!policy.allowed) {
    await logIntent({ tenantId: ctx.tenantId, capability: capabilityId, payload: redact(payload), policy, mode });
    return { policy, mode };
  }

  try {
    switch (ctx.autonomy_level) {
      case 1:
      case 2:
        // Observe only
        await impl.observe?.();
        break;
      case 3:
        outcome = await impl.suggest?.();
        break;
      case 4:
        outcome = await impl.prepare?.();
        break;
      case 5:
        try {
          outcome = await impl.execute?.();
        } catch (e) {
          // Degrade to prepare on failure
          outcome = await impl.prepare?.();
          if (outcome && typeof outcome === 'object') (outcome as any).degraded = true;
        }
        break;
      case 6:
        // Try execute, else overlay (GUI flow) if provided
        outcome = await (impl.execute?.() ?? impl.overlay?.());
        break;
    }
  } finally {
    await logIntent({ tenantId: ctx.tenantId, capability: capabilityId, payload: redact(payload), policy, mode, outcome });
  }
  return { outcome, policy, mode };
}

function redact(o: any) {
  const c = { ...o };
  delete (c as any).secret;
  delete (c as any).card;
  return c;
}
