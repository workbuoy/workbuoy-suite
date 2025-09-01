import { randomUUID } from 'crypto';

export function withTimeout<T>(p: Promise<T>, ms = 15000): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    p.then(v => { clearTimeout(t); resolve(v); }, e => { clearTimeout(t); reject(e); });
  });
}

export function ensureIdempotencyKey(headers: Record<string,string>): Record<string,string> {
  if (!headers['Idempotency-Key']) {
    headers['Idempotency-Key'] = randomUUID();
  }
  return headers;
}
