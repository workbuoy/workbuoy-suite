import { createHash } from 'crypto';

export interface AuditEntry {
  id: string;
  timestamp: string;
  component: 'buoy'|'navi'|'core'|'flex'|'secure'|'meta';
  level: 'info'|'warn'|'error'|'audit';
  message: string;
  metadata?: Record<string,unknown>;
  correlationId?: string;
  hash_prev?: string;
  hash_curr: string;
}

const chain: AuditEntry[] = [];

export function append(entry: Omit<AuditEntry,'hash_prev'|'hash_curr'>): AuditEntry {
  const prev = chain.length ? chain[chain.length-1].hash_curr : '';
  const payload = JSON.stringify({ ...entry, hash_prev: prev });
  const hash_curr = sha256(payload);
  const finalEntry: AuditEntry = { ...entry, hash_prev: prev, hash_curr };
  chain.push(finalEntry);
  return finalEntry;
}

export function verify(): boolean {
  let prev = '';
  for (const e of chain) {
    const payload = JSON.stringify({ ...e, hash_curr: undefined });
    const recompute = sha256(payload.replace(/,"hash_curr":undefined/,''));
    if (e.hash_prev !== prev || e.hash_curr !== recompute) return false;
    prev = e.hash_curr;
  }
  return true;
}

export function __reset(){ chain.length = 0; }
export function __all(){ return chain.slice(); }

function sha256(s: string) {
  return createHash('sha256').update(s).digest('hex');
}
