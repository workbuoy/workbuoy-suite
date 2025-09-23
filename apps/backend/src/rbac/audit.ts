export type AuditEntry = {
  ts: number;
  actor_id: string;
  role: string;
  entity_type: string;
  entity_id: string;
  action: string;
  allowed: boolean;
  reason?: string;
  before?: any;
  after?: any;
};

const _log: AuditEntry[] = [];

export function getAudit() { return _log; }
export function clearAudit() { _log.length = 0; }
export function pushAudit(entry: AuditEntry) { _log.push(entry); }
