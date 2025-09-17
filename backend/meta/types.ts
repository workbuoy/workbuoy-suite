import type { ProbeResult } from './probes';

export type HealthStatus = 'ok' | 'degraded' | 'down';

export interface HealthResponse {
  status: HealthStatus;
  uptime_s: number;
  git_sha: string;
  build_id?: string;
  started_at: string;
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
