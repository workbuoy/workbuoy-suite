import { RoleRegistry } from '../roles/registry';
import { policyCheckRoleAware, RoleAwareContext } from './policyRoleAware';
import { modeToKey, ProactivityMode } from './proactivity/modes';

interface CapabilityImpl<T> {
  observe?: () => Promise<void>;
  suggest?: () => Promise<T>;
  prepare?: () => Promise<T>;
  execute?: () => Promise<T>;
  overlay?: () => Promise<T>;
  rollback?: (outcome: T) => Promise<void>;
}

export async function runCapabilityWithRole<T>(
  rr: RoleRegistry,
  capabilityId: string,
  featureId: string | undefined,
  payload: any,
  ctx: RoleAwareContext,
  impl: CapabilityImpl<T>,
  policyCheckImpl: (input: any, ctx: any) => Promise<{ allowed: boolean; basis?: string[] }>,
  logIntent: (event: any) => Promise<void>
) {
  const { policy, proactivity } = await policyCheckRoleAware({ capability: capabilityId, featureId, payload }, ctx, rr, policyCheckImpl);
  const mode = proactivity.effective;
  const logBase = {
    tenantId: ctx.tenantId,
    capability: capabilityId,
    payload,
    policy,
    proactivity: {
      requested: proactivity.requestedKey,
      effective: proactivity.effectiveKey,
      basis: proactivity.basis,
    },
    mode: modeToKey(mode),
  };

  let outcome: T | undefined;

  if (!policy.allowed) {
    await logIntent({ ...logBase, degraded_mode: 'ask_approval' });
    return { policy, proactivity };
  }

  try {
    switch (mode) {
      case ProactivityMode.Usynlig:
      case ProactivityMode.Rolig:
        await impl.observe?.();
        break;
      case ProactivityMode.Proaktiv:
        outcome = await impl.suggest?.();
        break;
      case ProactivityMode.Ambisiøs:
        outcome = await impl.prepare?.();
        break;
      case ProactivityMode.Kraken:
        outcome = await impl.execute?.();
        break;
      case ProactivityMode.Tsunami: {
        if (impl.execute) {
          outcome = await impl.execute();
        }
        if (impl.overlay) {
          const overlayResult = await impl.overlay();
          outcome = (overlayResult ?? outcome) as T | undefined;
        }
        break;
      }
      default:
        await impl.observe?.();
        break;
    }
  } finally {
    await logIntent({ ...logBase, outcome });
  }

  return { outcome, policy, proactivity };
}
