import type { Probe, ProbeResult } from './probes';
import { recordMetaReadinessCheck } from '../../observability/metrics/meta';
import type { MetaReadinessResponse, MetaReadinessState } from './types';

const deriveState = (results: ProbeResult[]): MetaReadinessState => {
  if (results.some(result => result.status === 'fail')) {
    return 'not_ready';
  }
  if (results.some(result => result.status === 'warn')) {
    return 'degraded';
  }
  return 'ready';
};

const explode = (value: string): string[] => value.split(',').map(segment => segment.trim()).filter(Boolean);

const toArray = (maybe: string | string[] | undefined): string[] | undefined => {
  if (!maybe) {
    return undefined;
  }
  if (Array.isArray(maybe)) {
    return maybe.flatMap(explode);
  }
  return explode(maybe);
};

const normaliseInclude = (include?: string[]): Set<string> | undefined => {
  if (!include || include.length === 0) {
    return undefined;
  }
  const normalised = include
    .map(value => value.trim())
    .filter(value => value.length > 0)
    .map(value => value.toLowerCase());
  return normalised.length ? new Set(normalised) : undefined;
};

const safeCheck = async (probe: Probe): Promise<ProbeResult> => {
  try {
    const result = await probe.check();
    const latency = Number.isFinite(result.latency_ms) ? Math.max(0, result.latency_ms) : 0;
    return {
      name: result.name || probe.name,
      status: result.status,
      latency_ms: latency,
      ...(result.reason ? { reason: result.reason } : {}),
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'probe_failed';
    return {
      name: probe.name,
      status: 'fail',
      latency_ms: 0,
      reason,
    };
  }
};

export async function runReadiness(
  probes: Probe[],
  include?: string[] | string,
): Promise<MetaReadinessResponse> {
  const includeArray = toArray(include);
  const includeFilter = normaliseInclude(includeArray);
  const selected = includeFilter
    ? probes.filter(probe => includeFilter.has(probe.name.toLowerCase()))
    : probes;

  const results: ProbeResult[] = [];

  for (const probe of selected) {
    const result = await safeCheck(probe);
    recordMetaReadinessCheck(result.name, result.status);
    results.push(result);
  }

  const status = deriveState(results);
  return { status, checks: results };
}
