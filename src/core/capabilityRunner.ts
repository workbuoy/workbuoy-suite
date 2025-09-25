// src/core/capabilityRunner.ts
import { policyCheck } from './policy';
import { logIntent } from './intentLog';
import type { Autonomy, ModuleMode, PolicyResponse } from './types';

export interface CapabilityImpl<T=any> {
  observe?: () => Promise<void>;
  suggest?: () => Promise<T>;
  prepare?: () => Promise<T>;
  execute?: () => Promise<T>;
  overlay?: () => Promise<T>;
  rollback?: (outcome: T) => Promise<void>;
}

export interface CapabilityContext {
  autonomy_level: Autonomy;
  tenantId: string;
  role: string;
  risk?: Record<string, any>;
}

export async function runCapability<T>(
  capabilityId: string,
  payload: any,
  ctx: CapabilityContext,
  impl: CapabilityImpl<T>
): Promise<{ outcome?: T; policy: PolicyResponse }> {
  if (isKillSwitch(ctx.tenantId)) {
    const policy: PolicyResponse = { allowed: false, explanation: 'kill switch active', basis: ['ops:killswitch'] };
    await logIntent({ tenantId: ctx.tenantId, capability: capabilityId, payload: redact(payload), policy, mode: 'simulate' });
    return { policy };
  }

  const policy = await policyCheck({ capability: capabilityId, payload } as any, ctx);
  const mode: ModuleMode = ctx.autonomy_level >= 5 ? 'integration' : 'simulate';
  let outcome: any;

  if (!policy.allowed) {
    await logIntent({ tenantId: ctx.tenantId, capability: capabilityId, payload: redact(payload), policy, mode });
    return { policy };
  }

  try {
    switch (ctx.autonomy_level) {
      case 1:
      case 2:
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
          // degrade to prepare on error
          outcome = await impl.prepare?.();
          if (outcome && typeof outcome === 'object') (outcome as any).degraded = true;
        }
        break;
      case 6:
        outcome = await (impl.execute?.() ?? impl.overlay?.());
        break;
    }
  } finally {
    await logIntent({ tenantId: ctx.tenantId, capability: capabilityId, payload: redact(payload), policy, mode, outcome });
  }
  return { outcome, policy };
}

function isKillSwitch(tenantId: string) {
  // Global kill or tenant-scoped kill
  if (process.env.KILL_SWITCH_ALL === '1' || process.env.KILL_SWITCH_ALL === 'true') return true;
  const key = `KILL_SWITCH_TENANT_${tenantId}`;
  return process.env[key] === '1' || process.env[key] === 'true';
}

function redact(o: any) {
  if (!o || typeof o !== 'object') return o;
  const c: any = Array.isArray(o) ? [...o] : { ...o };
  delete c.card;
  delete c.secret;
  delete c.ssn;
  delete c.password;
  return c;
}
