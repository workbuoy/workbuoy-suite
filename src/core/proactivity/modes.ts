export enum ProactivityMode {
  Usynlig = 1,
  Rolig = 2,
  Proaktiv = 3,
  Ambisiøs = 4,
  Kraken = 5,
  Tsunami = 6,
}

export type ProactivityModeKey =
  | 'usynlig'
  | 'rolig'
  | 'proaktiv'
  | 'ambisiøs'
  | 'kraken'
  | 'tsunami';

export interface ProactivityModeMeta {
  id: ProactivityMode;
  key: ProactivityModeKey;
  label: string;
  description: string;
  degradeHint?: string;
  uiHints: {
    overlay?: boolean;
    callToAction?: string;
    banner?: string;
    healthChecks?: boolean;
    reviewType?: 'none' | 'passive' | 'suggestion' | 'approval' | 'execution';
  };
  basisExamples: string[];
}

export const PROACTIVITY_MODE_META: Record<ProactivityMode, ProactivityModeMeta> = {
  [ProactivityMode.Usynlig]: {
    id: ProactivityMode.Usynlig,
    key: 'usynlig',
    label: 'Usynlig',
    description: 'Observe quietly with no UI surfaces or interventions.',
    degradeHint: 'baseline fall-back when tenant kill switch is engaged',
    uiHints: {
      overlay: false,
      banner: 'Observing silently',
      callToAction: undefined,
      healthChecks: false,
      reviewType: 'none',
    },
    basisExamples: ['subscription:killswitch', 'policy:deny', 'roleCap:disabled'],
  },
  [ProactivityMode.Rolig]: {
    id: ProactivityMode.Rolig,
    key: 'rolig',
    label: 'Rolig',
    description: 'Observe system state and surface telemetry passively with no call to action.',
    degradeHint: 'fallback when automation is paused but monitoring continues',
    uiHints: {
      overlay: false,
      banner: 'Monitoring in read-only mode',
      callToAction: undefined,
      healthChecks: false,
      reviewType: 'passive',
    },
    basisExamples: ['roleCap:2', 'tenant:readonly'],
  },
  [ProactivityMode.Proaktiv]: {
    id: ProactivityMode.Proaktiv,
    key: 'proaktiv',
    label: 'Proaktiv',
    description: 'Suggest actions with lightweight call-to-action buttons.',
    degradeHint: 'default supervised mode when higher tiers not permitted',
    uiHints: {
      overlay: false,
      banner: 'Suggestions ready',
      callToAction: 'Show suggestions',
      healthChecks: false,
      reviewType: 'suggestion',
    },
    basisExamples: ['plan:flex', 'roleCap:3'],
  },
  [ProactivityMode.Ambisiøs]: {
    id: ProactivityMode.Ambisiøs,
    key: 'ambisiøs',
    label: 'Ambisiøs',
    description: 'Prepare changes, generate previews and require approval before execution.',
    degradeHint: 'requires reviewer sign-off before running automations',
    uiHints: {
      overlay: false,
      banner: 'Previews prepared',
      callToAction: 'Review & approve',
      healthChecks: false,
      reviewType: 'approval',
    },
    basisExamples: ['plan:flex', 'policy:requires_approval'],
  },
  [ProactivityMode.Kraken]: {
    id: ProactivityMode.Kraken,
    key: 'kraken',
    label: 'Kraken',
    description: 'Execute automations directly under policy guardrails.',
    degradeHint: 'falls back when execution guard fails',
    uiHints: {
      overlay: false,
      banner: 'Executing with guardrails',
      callToAction: 'View execution log',
      healthChecks: true,
      reviewType: 'execution',
    },
    basisExamples: ['plan:secure', 'roleCap:5', 'policy:execute_allowed'],
  },
  [ProactivityMode.Tsunami]: {
    id: ProactivityMode.Tsunami,
    key: 'tsunami',
    label: 'Tsunami',
    description: 'Execute, project overlay changes and continuously run health checks.',
    degradeHint: 'will degrade to Kraken on overlay or health-check failure',
    uiHints: {
      overlay: true,
      banner: 'Hands-free automation engaged',
      callToAction: 'Inspect live overlay',
      healthChecks: true,
      reviewType: 'execution',
    },
    basisExamples: ['plan:enterprise', 'roleCap:6', 'telemetry:overlay_ready'],
  },
};

export const DEFAULT_PROACTIVITY_MODE = ProactivityMode.Proaktiv;

export const PROACTIVITY_MODE_ORDER: ProactivityMode[] = [
  ProactivityMode.Usynlig,
  ProactivityMode.Rolig,
  ProactivityMode.Proaktiv,
  ProactivityMode.Ambisiøs,
  ProactivityMode.Kraken,
  ProactivityMode.Tsunami,
];

export const DEFAULT_DEGRADE_RAIL: ProactivityMode[] = [
  ProactivityMode.Tsunami,
  ProactivityMode.Kraken,
  ProactivityMode.Ambisiøs,
  ProactivityMode.Proaktiv,
  ProactivityMode.Rolig,
  ProactivityMode.Usynlig,
];

export function modeToKey(mode: ProactivityMode): ProactivityModeKey {
  return PROACTIVITY_MODE_META[mode]?.key ?? 'proaktiv';
}

export function parseProactivityMode(input: unknown, fallback: ProactivityMode = DEFAULT_PROACTIVITY_MODE): ProactivityMode {
  if (input === undefined || input === null) return fallback;
  if (typeof input === 'number' && PROACTIVITY_MODE_META[input as ProactivityMode]) {
    return input as ProactivityMode;
  }
  if (typeof input === 'string' && input.length) {
    const normalized = input.trim().toLowerCase();
    const matched = PROACTIVITY_MODE_ORDER.find(mode => modeToKey(mode) === normalized);
    if (matched) return matched;
    const asNumber = Number(normalized);
    if (!Number.isNaN(asNumber) && PROACTIVITY_MODE_META[asNumber as ProactivityMode]) {
      return asNumber as ProactivityMode;
    }
  }
  return fallback;
}

export function isExecutionMode(mode: ProactivityMode) {
  return mode >= ProactivityMode.Kraken;
}
