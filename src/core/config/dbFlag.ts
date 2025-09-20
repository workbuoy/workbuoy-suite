/**
 * DB feature flag.
 * If FF_PERSISTENCE !== "true", controllers should use in-memory stores.
 */
const truthyValues = new Set(['true', '1', 'yes']);

export function persistenceEnabled(): boolean {
  const flag = process.env.FF_PERSISTENCE ?? process.env.DB_ENABLED ?? '';
  return truthyValues.has(String(flag).toLowerCase());
}

export function dbEnabled(): boolean {
  return persistenceEnabled();
}

export function persistenceMode(): 'db' | 'memory' {
  return persistenceEnabled() ? 'db' : 'memory';
}
