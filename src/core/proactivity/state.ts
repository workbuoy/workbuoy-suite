import { DEFAULT_DEGRADE_RAIL, ProactivityMode } from './modes';
import { assertDefined } from '../../utils/require';

export interface ProactivityCap {
  id: string;
  label?: string;
  mode: ProactivityMode;
  enforced?: boolean;
  basis?: string[];
  degradeTag?: string;
}

export interface ResolveEffectiveModeInput {
  requested: ProactivityMode;
  caps?: ProactivityCap[];
  killSwitch?: boolean;
  degradeRail?: ProactivityMode[];
  basis?: string[];
}

export interface ProactivityResolution {
  requested: ProactivityMode;
  effective: ProactivityMode;
  basis: string[];
  caps: ProactivityCap[];
  degradeRail: ProactivityMode[];
}

function clampToRail(mode: ProactivityMode, rail: ProactivityMode[]): ProactivityMode {
  if (!rail.length) {
    throw new Error('Invariant: degrade rail must contain at least one mode.');
  }
  if (rail.includes(mode)) return mode;
  // fall back to numeric comparison when mode not explicitly in rail
  const sorted = [...rail].sort((a, b) => b - a);
  for (const candidate of sorted) {
    if (candidate !== undefined && candidate <= mode) return candidate;
  }
  const fallback = assertDefined(sorted[sorted.length - 1], 'degrade rail fallback');
  return fallback;
}

function degradeDown(current: ProactivityMode, limit: ProactivityMode, rail: ProactivityMode[]): ProactivityMode {
  if (current <= limit) return current;
  const order = [...rail];
  const idx = order.indexOf(current);
  if (idx === -1) {
    return Math.max(limit, ProactivityMode.Usynlig) as ProactivityMode;
  }
  for (let i = idx; i < order.length; i += 1) {
    const candidate = order[i];
    if (candidate !== undefined && candidate <= limit) {
      return candidate;
    }
  }
  const fallback = assertDefined(order[order.length - 1], 'degrade rail exhausted without fallback');
  return fallback;
}

export function resolveEffectiveMode(input: ResolveEffectiveModeInput): ProactivityResolution {
  const rail = input.degradeRail?.length ? input.degradeRail : DEFAULT_DEGRADE_RAIL;
  if (!rail.length) {
    throw new Error('Invariant: resolveEffectiveMode requires non-empty degrade rail.');
  }
  const caps = (input.caps ?? []).map(cap => ({
    ...cap,
    mode: clampToRail(cap.mode, rail),
  }));

  const basis = new Set<string>(input.basis ?? []);
  const requested = clampToRail(input.requested, rail);
  basis.add(`mode:requested=${requested}`);

  let effective = requested;

  if (input.killSwitch) {
    effective = ProactivityMode.Usynlig;
    basis.add('kill');
    basis.add('degraded:kill');
  }

  for (const cap of caps) {
    if (effective > cap.mode) {
      effective = degradeDown(effective, cap.mode, rail);
      if (Array.isArray(cap.basis)) {
        for (const entry of cap.basis) basis.add(entry);
      }
      basis.add(`degraded:${cap.degradeTag ?? cap.id}`);
    }
  }

  basis.add(`mode:effective=${effective}`);

  return {
    requested,
    effective,
    basis: Array.from(basis),
    caps,
    degradeRail: rail,
  };
}

export function degradeOnError(
  current: ProactivityMode,
  rail: ProactivityMode[] = DEFAULT_DEGRADE_RAIL
): ProactivityMode {
  const idx = rail.indexOf(current);
  if (idx === -1) {
    const fallback = Math.max(current - 1, ProactivityMode.Usynlig) as ProactivityMode;
    return fallback;
  }
  if (idx < rail.length - 1) {
    const next = rail[idx + 1];
    if (next === undefined) {
      throw new Error('Invariant: degrade rail missing next mode.');
    }
    return next;
  }
  const final = rail[rail.length - 1];
  if (final === undefined) {
    throw new Error('Invariant: degrade rail has no terminal mode.');
  }
  return final;
}
