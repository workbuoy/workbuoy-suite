import type { ProbeResult } from './probes';

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
