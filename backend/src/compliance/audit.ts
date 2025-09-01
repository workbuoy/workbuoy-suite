export type AuditEntry = {
  ts: number;
  actor: string;
  action: string;
  subject: string;
  jobId?: string;
  payload?: any;
};

const buf: AuditEntry[] = [];

export function pushAudit(e: AuditEntry){ buf.push(e); }
export function getAudit(){ return buf; }
export function clearAudit(){ buf.length = 0; }
