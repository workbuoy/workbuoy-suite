import { RoleRegistry } from '../../roles/registry';
import type { UserRoleBinding } from '../../roles/types';
import { PROACTIVITY_MODE_META, ProactivityMode, modeToKey, parseProactivityMode, DEFAULT_DEGRADE_RAIL } from './modes';
import { resolveEffectiveMode, ProactivityCap, ProactivityResolution } from './state';
import { getSubscriptionCap } from '../subscription/state';
import type { SubscriptionCapSummary } from '../subscription/state';

export interface ProactivityContextInput {
  tenantId: string;
  roleRegistry?: RoleRegistry;
  roleBinding?: UserRoleBinding;
  featureId?: string;
  requestedMode?: string | number | ProactivityMode;
  compatMode?: string | number | undefined;
  policyCap?: ProactivityMode;
  degradeRail?: ProactivityMode[];
  basis?: string[];
}

export interface ProactivityState extends ProactivityResolution {
  tenantId: string;
  requestedKey: string;
  effectiveKey: string;
  uiHints: typeof PROACTIVITY_MODE_META[ProactivityMode.Proaktiv]['uiHints'];
  chip: typeof PROACTIVITY_MODE_META[ProactivityMode.Proaktiv]['chip'];
  meta: typeof PROACTIVITY_MODE_META[ProactivityMode.Proaktiv];
  subscription: SubscriptionCapSummary;
  featureId?: string;
  timestamp: string;
}

function resolveRoleCap(
  registry: RoleRegistry | undefined,
  tenantId: string,
  binding: UserRoleBinding | undefined,
  featureIdHint?: string,
): { cap?: ProactivityMode; featureId?: string } {
  if (!registry || !binding) return {};
  const userCtx = registry.getUserContext(tenantId, binding);
  const featureWithCap = featureIdHint
    ? userCtx.features.find(f => f.id === featureIdHint)
    : userCtx.features.reduce<{ feature?: typeof userCtx.features[number]; cap?: ProactivityMode }>((best, f) => {
        const cap = (userCtx.featureCaps[f.id] ?? f.autonomyCap ?? f.defaultAutonomyCap ?? ProactivityMode.Proaktiv) as ProactivityMode;
        if (!best.feature || (best.cap ?? ProactivityMode.Usynlig) < cap) {
          return { feature: f, cap };
        }
        return best;
      }, {} as { feature?: typeof userCtx.features[number]; cap?: ProactivityMode }).feature;

  if (!featureWithCap) return {};
  const cap = (userCtx.featureCaps[featureWithCap.id] ?? featureWithCap.autonomyCap ?? featureWithCap.defaultAutonomyCap ?? ProactivityMode.Proaktiv) as ProactivityMode;
  return { cap, featureId: featureWithCap.id };
}

export function buildProactivityContext(input: ProactivityContextInput): ProactivityState {
  const subscription = getSubscriptionCap(input.tenantId);
  const caps: ProactivityCap[] = [
    {
      id: `subscription:${subscription.plan}`,
      label: `plan:${subscription.plan}`,
      mode: subscription.maxMode,
      basis: [`tenantPlan:${subscription.plan}`].concat(subscription.secureTenant ? ['tenant<=3'] : []),
      degradeTag: 'subscription',
    },
  ];
  const basis = new Set<string>(input.basis ?? []);
  basis.add(`tenantPlan:${subscription.plan}`);
  if (subscription.secureTenant) basis.add('tenant<=3');

  const compatRequested = mapCompatMode(input.compatMode);
  const requested = parseProactivityMode(
    input.requestedMode ?? compatRequested ?? undefined,
    compatRequested ?? undefined,
  );
  const rail = input.degradeRail && input.degradeRail.length ? input.degradeRail : DEFAULT_DEGRADE_RAIL;

  const { cap: roleCap, featureId } = resolveRoleCap(input.roleRegistry, input.tenantId, input.roleBinding, input.featureId);
  if (roleCap) {
    const featureTag = featureId ?? 'default';
    caps.push({
      id: featureId ? `role:${featureId}` : 'role',
      label: featureId ?? 'role',
      mode: roleCap,
      basis: [`roleCap:${featureTag}=${roleCap}`],
      degradeTag: `role:${featureTag}`,
    });
    basis.add(`roleCap:${featureTag}=${roleCap}`);
  }

  if (input.policyCap) {
    caps.push({
      id: 'policy',
      label: 'policy',
      mode: input.policyCap,
      basis: [`policyCap:policy=${input.policyCap}`],
      degradeTag: 'policy',
    });
  }

  const resolution = resolveEffectiveMode({
    requested,
    caps,
    killSwitch: subscription.killSwitch,
    degradeRail: rail,
    basis: Array.from(basis),
  });

  const meta = PROACTIVITY_MODE_META[resolution.effective];
  const state: ProactivityState = {
    ...resolution,
    tenantId: input.tenantId,
    requestedKey: modeToKey(resolution.requested),
    effectiveKey: modeToKey(resolution.effective),
    uiHints: meta.uiHints,
    chip: meta.chip,
    meta,
    subscription,
    featureId,
    timestamp: new Date().toISOString(),
  };
  return state;
}

function mapCompatMode(input: unknown): ProactivityMode | undefined {
  if (input === undefined || input === null) return undefined;
  const numeric = typeof input === 'number' ? input : Number(input);
  if (!Number.isFinite(numeric)) return undefined;
  if (numeric <= 1) return ProactivityMode.Proaktiv;
  if (numeric === 2) return ProactivityMode.Ambisiøs;
  if (numeric >= 3) return ProactivityMode.Kraken;
  return undefined;
}
