import type { MetaCapabilitiesResponse, MetaConnectorCapability } from './types.js';
import type { ProviderName } from '../src/connectors/types.js';

const BOOLEAN_TRUE_VALUES = new Set(['1', 'true', 'yes', 'on', 'enabled']);
const BOOLEAN_FALSE_VALUES = new Set(['0', 'false', 'no', 'off', 'disabled']);

const MODE_DEFAULTS: Readonly<MetaCapabilitiesResponse['modes']> = {
  core: true,
  flex: false,
  secure: false,
};

type ConnectorRegistryEntry = {
  name: ProviderName;
  defaultEnabled: boolean;
};

const CONNECTOR_REGISTRY: ReadonlyArray<ConnectorRegistryEntry> = [
  { name: 'hubspot', defaultEnabled: true },
  { name: 'salesforce', defaultEnabled: true },
  { name: 'dynamics', defaultEnabled: true },
];

const FEATURE_FLAG_PREFIX = 'META_FEATURE_';

const CONNECTOR_ENV_PREFIXES = ['META_CONNECTOR_', 'WB_CONNECTOR_', 'CONNECTOR_'] as const;

function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) {
    return defaultValue;
  }
  const normalised = value.trim().toLowerCase();
  if (BOOLEAN_TRUE_VALUES.has(normalised)) {
    return true;
  }
  if (BOOLEAN_FALSE_VALUES.has(normalised)) {
    return false;
  }
  return defaultValue;
}

function coalesceEnv(keys: readonly string[]): string | undefined {
  for (const key of keys) {
    const raw = process.env[key];
    if (raw !== undefined) {
      return raw;
    }
  }
  return undefined;
}

function resolveModes(): MetaCapabilitiesResponse['modes'] {
  const deriveMode = (mode: keyof MetaCapabilitiesResponse['modes']): boolean => {
    const modeKey = String(mode).toUpperCase();
    const envCandidates = [
      `META_MODE_${modeKey}`,
      `META_MODE_${modeKey}_ENABLED`,
      `WB_MODE_${modeKey}`,
      `WB_MODE_${modeKey}_ENABLED`,
    ] as const;
    return parseBoolean(coalesceEnv(envCandidates), MODE_DEFAULTS[mode]);
  };

  return {
    core: deriveMode('core'),
    flex: deriveMode('flex'),
    secure: deriveMode('secure'),
  };
}

function resolveConnectorToggle(name: ProviderName, fallback: boolean): boolean {
  const envKeys = CONNECTOR_ENV_PREFIXES.map((prefix) => `${prefix}${name.toUpperCase()}_ENABLED`);
  return parseBoolean(coalesceEnv(envKeys), fallback);
}

function resolveConnectors(): MetaConnectorCapability[] {
  const globalDefault = parseBoolean(
    coalesceEnv(['META_CONNECTORS_ENABLED', 'WB_CONNECTORS_ENABLED', 'CONNECTORS_ENABLED']),
    true,
  );

  return CONNECTOR_REGISTRY.map(({ name, defaultEnabled }) => ({
    name,
    enabled: resolveConnectorToggle(name, globalDefault && defaultEnabled),
  }));
}

function sanitiseFeatureName(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }
  return trimmed.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
}

function parseAggregatedFeatureFlags(raw: string | undefined): Record<string, boolean> {
  if (!raw) {
    return {};
  }

  const flags: Record<string, boolean> = {};
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      for (const [key, value] of Object.entries(parsed)) {
        const name = sanitiseFeatureName(key);
        if (!name) {
          continue;
        }
        if (typeof value === 'boolean') {
          flags[name] = value;
          continue;
        }
        if (typeof value === 'number') {
          flags[name] = value !== 0;
          continue;
        }
        if (typeof value === 'string') {
          flags[name] = parseBoolean(value, true);
        }
      }
      return flags;
    }
  } catch {
    // Fallback to comma-separated parsing below.
  }

  const segments = raw
    .split(',')
    .map((segment) => segment.trim())
    .filter(Boolean);
  for (const segment of segments) {
    const [namePart, valuePart] = segment.split('=');
    const name = sanitiseFeatureName(namePart ?? '');
    if (!name) {
      continue;
    }
    flags[name] = parseBoolean(valuePart, true);
  }
  return flags;
}

function resolveFeatureFlags(): Record<string, boolean> {
  const aggregated = parseAggregatedFeatureFlags(process.env.META_FEATURE_FLAGS);
  const flags: Record<string, boolean> = { ...aggregated };

  for (const [key, value] of Object.entries(process.env)) {
    if (!key.startsWith(FEATURE_FLAG_PREFIX) || key === 'META_FEATURE_FLAGS') {
      continue;
    }
    const name = sanitiseFeatureName(key.slice(FEATURE_FLAG_PREFIX.length));
    if (!name) {
      continue;
    }
    flags[name] = parseBoolean(value, true);
  }

  const entries = Object.entries(flags);
  entries.sort(([a], [b]) => a.localeCompare(b));
  return Object.fromEntries(entries);
}

export function getCapabilities(): MetaCapabilitiesResponse {
  return {
    modes: resolveModes(),
    connectors: resolveConnectors(),
    feature_flags: resolveFeatureFlags(),
  };
}

export default getCapabilities;
