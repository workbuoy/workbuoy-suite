import crypto from 'node:crypto';
import { RoleRegistry } from '../roles/registry';
import { executeConnectorAction } from '../connectors/execution';
import { policyCheckRoleAware, RoleAwareContext } from './policyRoleAware';
import { createProposal, sanitizeProposal } from './proposals/service';
import { modeToKey, ProactivityMode } from './proactivity/modes';

export interface CapabilityImpl<T> {
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
    effectiveMode: proactivity.effectiveKey,
  };

  let outcome: T | undefined;
  const logExtra: Record<string, any> = {};
  let proposalResult: any;
  let executionKey = ctx.idempotencyKey;

  if (!policy.allowed) {
    await logIntent({ ...logBase, ...logExtra, degraded_mode: 'ask_approval' });
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
        outcome = await (impl.prepare?.() ?? impl.suggest?.());
        proposalResult = await createProposal({
          tenantId: ctx.tenantId,
          userId: ctx.roleBinding.userId,
          featureId,
          capabilityId,
          payload,
          preview: outcome,
          idempotencyKey: executionKey ?? null,
          basis: proactivity.basis,
          requestedMode: proactivity.requested,
          effectiveMode: proactivity.effective,
        });
        logExtra.proposalId = proposalResult.id;
        if (proposalResult.idempotencyKey) logExtra.idempotencyKey = proposalResult.idempotencyKey;
        break;
      case ProactivityMode.Kraken:
        if (impl.execute) {
          executionKey = ensureIdempotencyKey(executionKey);
          const connector = ctx.connectorName ?? capabilityId.split('.')[0] ?? 'capability';
          const { response } = await executeConnectorAction(
            {
              connector,
              capabilityId,
              action: capabilityId,
              payload,
              idempotencyKey: executionKey,
            },
            () => impl.execute!(),
          );
          outcome = response as T;
          logExtra.idempotencyKey = executionKey;
        } else {
          outcome = await impl.prepare?.();
        }
        break;
      case ProactivityMode.Tsunami: {
        if (impl.execute) {
          executionKey = ensureIdempotencyKey(executionKey);
          const connector = ctx.connectorName ?? capabilityId.split('.')[0] ?? 'capability';
          const { response } = await executeConnectorAction(
            {
              connector,
              capabilityId,
              action: capabilityId,
              payload,
              idempotencyKey: executionKey,
            },
            () => impl.execute!(),
          );
          outcome = response as T;
          logExtra.idempotencyKey = executionKey;
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
    await logIntent({ ...logBase, ...logExtra, outcome });
  }

  if (proposalResult) {
    return { policy, proactivity, proposal: sanitizeProposal(proposalResult), outcome };
  }

  return { outcome, policy, proactivity, idempotencyKey: executionKey };
}

function ensureIdempotencyKey(existing?: string): string {
  if (existing && existing.length > 0) return existing;
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `idemp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
