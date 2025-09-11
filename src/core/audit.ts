import { createHash } from "crypto";
let lastHash = "";
export interface AuditEntry { ts: string; action: string; data?: any; prevHash?: string; hash?: string; }
export function appendAudit(action: string, data?: any): AuditEntry {
  const ts = new Date().toISOString();
  const input = `${lastHash}|${ts}|${action}|${JSON.stringify(data ?? {})}`;
  const hash = createHash("sha256").update(input).digest("hex");
  const entry: AuditEntry = { ts, action, data, prevHash: lastHash, hash };
  lastHash = hash;
  return entry;
}
