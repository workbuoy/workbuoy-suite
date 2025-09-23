import { recordPolicyDenyMetric } from '../../observability/metrics/meta';

import type {
  MetaPolicyAutonomyLevel,
  MetaPolicyProfile,
  MetaPolicySnapshotResponse,
  MetaPolicyDenyCounters,
} from './types';

const HOUR_IN_MS = 60 * 60 * 1000;
const DAY_IN_MS = 24 * HOUR_IN_MS;

const DEFAULT_AUTONOMY_LEVEL: MetaPolicyAutonomyLevel = 1;
const DEFAULT_POLICY_PROFILE: MetaPolicyProfile = 'default';

const AUTONOMY_ENV_KEYS = [
  'META_POLICY_AUTONOMY_LEVEL',
  'META_AUTONOMY_LEVEL',
  'WB_POLICY_AUTONOMY_LEVEL',
] as const;

const PROFILE_ENV_KEYS = ['META_POLICY_PROFILE', 'META_PROFILE', 'WB_POLICY_PROFILE'] as const;

export interface PolicyEngineSnapshot {
  autonomyLevel: MetaPolicyAutonomyLevel;
  policyProfile: MetaPolicyProfile;
}

export interface PolicyEngine {
  getSnapshot(): PolicyEngineSnapshot | Promise<PolicyEngineSnapshot>;
}

export interface PolicyMetricsStore {
  recordDeny(at?: Date | number): boolean;
  getWindowCounts(now: Date): MetaPolicyDenyCounters;
}

class EnvPolicyEngine implements PolicyEngine {
  getSnapshot(): PolicyEngineSnapshot {
    const autonomyRaw = coalesceEnv(AUTONOMY_ENV_KEYS);
    const profileRaw = coalesceEnv(PROFILE_ENV_KEYS);
    return {
      autonomyLevel: parseAutonomyLevel(autonomyRaw),
      policyProfile: parsePolicyProfile(profileRaw),
    };
  }
}

export class InMemoryPolicyMetricsStore implements PolicyMetricsStore {
  private events: number[] = [];

  recordDeny(at?: Date | number): boolean {
    const timestamp = resolveTimestamp(at);
    if (!Number.isFinite(timestamp)) {
      return false;
    }
    this.events.push(timestamp);
    this.prune(timestamp);
    return true;
  }

  getWindowCounts(now: Date): MetaPolicyDenyCounters {
    const nowMs = resolveTimestamp(now);
    this.prune(nowMs);
    const hourThreshold = nowMs - HOUR_IN_MS;
    const dayThreshold = nowMs - DAY_IN_MS;

    let lastHour = 0;
    let lastDay = 0;

    for (const ts of this.events) {
      if (ts >= dayThreshold) {
        lastDay += 1;
        if (ts >= hourThreshold) {
          lastHour += 1;
        }
      }
    }

    return {
      last_1h: lastHour,
      last_24h: lastDay,
    };
  }

  private prune(reference: number): void {
    const threshold = reference - DAY_IN_MS;
    if (this.events.length === 0) {
      return;
    }
    this.events = this.events.filter((timestamp) => timestamp >= threshold);
  }
}

function coalesceEnv(keys: readonly string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key];
    if (value !== undefined) {
      return value;
    }
  }
  return undefined;
}

function parseAutonomyLevel(raw: string | undefined): MetaPolicyAutonomyLevel {
  if (raw === undefined) {
    return DEFAULT_AUTONOMY_LEVEL;
  }
  const parsed = Number(raw);
  if (!Number.isInteger(parsed)) {
    return DEFAULT_AUTONOMY_LEVEL;
  }
  if (parsed === 0 || parsed === 1 || parsed === 2) {
    return parsed as MetaPolicyAutonomyLevel;
  }
  return DEFAULT_AUTONOMY_LEVEL;
}

function parsePolicyProfile(raw: string | undefined): MetaPolicyProfile {
  if (!raw) {
    return DEFAULT_POLICY_PROFILE;
  }
  const normalised = raw.trim().toLowerCase();
  if (normalised === 'default' || normalised === 'secure' || normalised === 'custom') {
    return normalised;
  }
  return DEFAULT_POLICY_PROFILE;
}

function resolveTimestamp(input?: Date | number): number {
  if (input instanceof Date) {
    return input.getTime();
  }
  if (typeof input === 'number') {
    return input;
  }
  return Date.now();
}

function normaliseAutonomyValue(value: unknown): MetaPolicyAutonomyLevel {
  if (typeof value === 'number' && Number.isInteger(value)) {
    if (value === 0 || value === 1 || value === 2) {
      return value as MetaPolicyAutonomyLevel;
    }
    return DEFAULT_AUTONOMY_LEVEL;
  }
  if (typeof value === 'string') {
    return parseAutonomyLevel(value);
  }
  return DEFAULT_AUTONOMY_LEVEL;
}

function normalisePolicyProfileValue(value: unknown): MetaPolicyProfile {
  if (typeof value === 'string') {
    return parsePolicyProfile(value);
  }
  return DEFAULT_POLICY_PROFILE;
}

function normaliseCounters(counters: MetaPolicyDenyCounters): MetaPolicyDenyCounters {
  return {
    last_1h: normaliseCount(counters.last_1h),
    last_24h: normaliseCount(counters.last_24h),
  };
}

function normaliseCount(value: number): number {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }
  return Math.floor(value);
}

let activeEngine: PolicyEngine = new EnvPolicyEngine();
let activeMetrics: PolicyMetricsStore = new InMemoryPolicyMetricsStore();

export interface PolicySnapshotConfiguration {
  engine?: PolicyEngine;
  metrics?: PolicyMetricsStore;
}

export function configurePolicySnapshot(config: PolicySnapshotConfiguration = {}): void {
  if (config.engine) {
    activeEngine = config.engine;
  }
  if (config.metrics) {
    activeMetrics = config.metrics;
  }
}

export function resetPolicySnapshot(): void {
  activeEngine = new EnvPolicyEngine();
  activeMetrics = new InMemoryPolicyMetricsStore();
}

export function recordPolicyDeny(at?: Date | number, feature = 'policy', reason = 'deny'): void {
  const recorded = activeMetrics.recordDeny(at);
  if (recorded) {
    recordPolicyDenyMetric(feature, reason);
  }
}

export async function getPolicySnapshot(
  now: Date = new Date(),
): Promise<MetaPolicySnapshotResponse> {
  const snapshot = await Promise.resolve(activeEngine.getSnapshot());
  const deny_counters = normaliseCounters(activeMetrics.getWindowCounts(now));
  return {
    autonomy_level: normaliseAutonomyValue(snapshot.autonomyLevel),
    policy_profile: normalisePolicyProfileValue(snapshot.policyProfile),
    deny_counters,
  };
}

export function getActivePolicyEngine(): PolicyEngine {
  return activeEngine;
}

export function getActivePolicyMetrics(): PolicyMetricsStore {
  return activeMetrics;
}
