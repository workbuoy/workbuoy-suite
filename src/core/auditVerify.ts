/**
 * Minimal hashchain verification for audit log entries.
 * We intentionally do NOT recompute hashes (payload hashing differs per implementation).
 * We only verify that each entry.prevHash === previous entry.hash.
 */
export type ChainEntry = { hash: string; prevHash?: string | null };

export function verifyHashChain(entries: ChainEntry[]): { ok: boolean; brokenAt?: number } {
  if (!Array.isArray(entries)) return { ok: false, brokenAt: 0 };
  for (let i = 0; i < entries.length; i++) {
    if (!entries[i] || typeof entries[i].hash !== "string") return { ok: false, brokenAt: i };
    if (i === 0) continue;
    const prev = entries[i - 1];
    if (entries[i].prevHash !== prev.hash) {
      return { ok: false, brokenAt: i };
    }
  }
  return { ok: true };
}
