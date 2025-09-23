import { Probe, ProbeResult, ProbeStatus } from './types';

export interface ProbeCheckResult {
  status: ProbeStatus;
  reason?: string;
}

export interface ProbeDependencies {
  name?: string;
  check: () => Promise<ProbeCheckResult>;
  now?: () => number;
}

const defaultNow = () => Date.now();

export function createProbe(defaultName: string, deps: ProbeDependencies): Probe {
  const { check, name, now = defaultNow } = deps;
  const probeName = name ?? defaultName;

  return {
    name: probeName,
    async check(): Promise<ProbeResult> {
      const startedAt = now();
      try {
        const result = await check();
        const latencyMs = Math.max(0, now() - startedAt);
        return {
          name: probeName,
          status: result.status,
          latency_ms: latencyMs,
          ...(result.reason ? { reason: result.reason } : {}),
        };
      } catch (error) {
        const latencyMs = Math.max(0, now() - startedAt);
        const reason = error instanceof Error ? error.message : 'probe_failed';
        return {
          name: probeName,
          status: 'fail',
          latency_ms: latencyMs,
          reason,
        };
      }
    },
  };
}
