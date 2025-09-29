const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on']);

function readBooleanFlag(name: string): boolean {
  const raw = process.env[name];
  if (typeof raw !== 'string') {
    return false;
  }

  const normalized = raw.trim().toLowerCase();
  if (!normalized) {
    return false;
  }

  return TRUE_VALUES.has(normalized);
}

export function isTelemetryEnabled(): boolean {
  return readBooleanFlag('TELEMETRY_ENABLED');
}

export function isLoggingEnabled(): boolean {
  return readBooleanFlag('LOGGING_ENABLED');
}

export const TELEMETRY_ENABLED = isTelemetryEnabled();
export const LOGGING_ENABLED = isLoggingEnabled();
