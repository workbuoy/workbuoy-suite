export type HealthResponse = {
  status: 'ok' | 'degraded' | 'down';
  uptime_s: number;
  git_sha: string;
  build_id?: string;
  started_at: string;
};
export type ReadinessCheck = {
  name: string;
  status: 'ok' | 'fail' | 'warn';
  latency_ms: number;
  reason?: string;
};
export type ReadinessResponse = {
  status: 'ready' | 'degraded' | 'not_ready';
  checks: ReadinessCheck[];
};
export type VersionResponse = {
  semver: string;
  git_sha: string;
  built_at: string;
  commit_time?: string;
};
export type CapabilitiesResponse = {
  modes: { core: boolean; flex: boolean; secure: boolean };
  connectors: Array<{ name: string; enabled: boolean }>;
  feature_flags: Record<string, boolean>;
};
export type PolicyResponse = {
  autonomy_level: 0 | 1 | 2;
  policy_profile: 'default' | 'secure' | 'custom';
  deny_counters: { last_1h: number; last_24h: number };
};
export type AuditStatsResponse = {
  window: { from: string; to: string };
  totals: { intents: number; actions: number; failures: number };
  top_errors: Array<{ code: string; count: number }>;
};
