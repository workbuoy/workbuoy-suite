export function generateAuditId(): string {
  return `audit-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}
