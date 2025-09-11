/**
 * DB feature flag.
 * If DB_ENABLED !== "true", controllers should use in-memory stores.
 */
export function dbEnabled(): boolean {
  return process.env.DB_ENABLED === "true";
}
