import { collectDefaultMetrics, Registry } from 'prom-client';
import pkg from '../../package.json' with { type: 'json' };
import { getDefaultLabels, getMetricsPrefix, isMetricsEnabled } from '../observability/metricsConfig.js';

type PackageJson = { version?: string };

const packageJson = pkg as PackageJson;
const PACKAGE_VERSION =
  typeof packageJson?.version === 'string' ? packageJson.version : 'dev';

const BASE_DEFAULT_LABELS: Record<string, string> = {
  service: 'backend',
  version: PACKAGE_VERSION,
};

function normaliseCustomLabels(
  rawLabels: Record<string, string>,
): Record<string, string> {
  const entries = Object.entries(rawLabels ?? {});
  return entries.reduce<Record<string, string>>((acc, [key, value]) => {
    if (key === 'service_name' || key === 'service' || key === 'version') {
      return acc;
    }

    acc[key] = value;
    return acc;
  }, {});
}

let registry: Registry | null = null;
let defaultMetricsRegistered = false;

export function getRegistry(): Registry {
  if (!registry) {
    registry = new Registry();
    const labels = {
      ...BASE_DEFAULT_LABELS,
      ...normaliseCustomLabels(getDefaultLabels()),
    };
    registry.setDefaultLabels(labels);
  }

  return registry;
}

export function resetRegistryForTests(): void {
  registry = null;
  defaultMetricsRegistered = false;
}

export function ensureDefaultNodeMetrics(): void {
  if (!isMetricsEnabled() || defaultMetricsRegistered) {
    return;
  }

  collectDefaultMetrics({ register: getRegistry(), prefix: getMetricsPrefix() });
  defaultMetricsRegistered = true;
}
