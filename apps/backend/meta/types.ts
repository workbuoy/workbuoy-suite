import type { ProbeResult } from './probes/index.js';

export type HealthStatus = 'ok' | 'degraded' | 'down';

export interface HealthResponse {
  status: HealthStatus;
  uptime_s: number;
  git_sha: string;
  build_id?: string;
  started_at: string;
}

export interface MetaConnectorCapability {
  name: string;
  enabled: boolean;
}

export interface MetaCapabilitiesResponse {
  modes: {
    core: boolean;
    flex: boolean;
    secure: boolean;
  };
  connectors: MetaConnectorCapability[];
  feature_flags: Record<string, boolean>;
}

export interface VersionResponse {
  semver: string;
  git_sha: string;
  built_at: string;
  commit_time?: string;
}

export type MetaReadinessState = 'ready' | 'degraded' | 'not_ready';

export interface MetaReadinessResponse {
  status: MetaReadinessState;
  checks: ProbeResult[];
  reason?: string;
}

export type MetaPolicyAutonomyLevel = 0 | 1 | 2;

export type MetaPolicyProfile = 'default' | 'secure' | 'custom';

export interface MetaPolicyDenyCounters {
  last_1h: number;
  last_24h: number;
}

export interface MetaPolicySnapshotResponse {
  autonomy_level: MetaPolicyAutonomyLevel;
  policy_profile: MetaPolicyProfile;
  deny_counters: MetaPolicyDenyCounters;
}
