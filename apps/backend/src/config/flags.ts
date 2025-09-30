export function isTelemetryEnabled(): boolean {
  return TELEMETRY_ENABLED;
}

export function isLoggingEnabled(): boolean {
  return LOGGING_ENABLED;
}

export const TELEMETRY_ENABLED = process.env.TELEMETRY_ENABLED === 'true';
export const LOGGING_ENABLED = process.env.LOGGING_ENABLED === 'true';
