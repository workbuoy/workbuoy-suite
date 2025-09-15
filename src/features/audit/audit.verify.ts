// src/features/audit/audit.verify.ts
import { auditRepo, AuditEntry } from '../../core/audit/audit.repo';

export async function verifyAuditChain(): Promise<{ok:boolean; brokenAt?:string}> {
  const entries = await auditRepo.all();
  if (entries.length === 0) return { ok: true };
  let prev: AuditEntry | null = null;
  for (const e of entries) {
    if (prev && e.prevHash !== prev.hash) {
      return { ok: false, brokenAt: e.id };
    }
    prev = e;
  }
  return { ok: true };
}
