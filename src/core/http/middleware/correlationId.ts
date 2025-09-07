export function getCorrelationId(existing?: string): string {
  return existing || `corr-${Math.random().toString(36).substring(2, 10)}`;
}
