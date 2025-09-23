import { readFileSync, statSync } from 'fs';
import { resolve } from 'path';

let cache: { path: string, mtimeMs: number, data: any } | null = null;
const DEFAULT_PATH = process.env.SECRET_FILE || '/etc/workbuoy/secrets.json';
const TTL_MS = parseInt(process.env.SECRET_TTL_MS || '5000', 10);

function loadFile(p: string) {
  const st = statSync(p, { throwIfNoEntry: false } as any);
  if (!st) return null;
  const data = JSON.parse(readFileSync(p, 'utf8'));
  return { mtimeMs: st.mtimeMs, data };
}

export function getSecret(key: string, fallbackEnv?: string): string | undefined {
  const path = resolve(process.env.SECRET_FILE || DEFAULT_PATH);
  const now = Date.now();
  if (!cache || cache.path !== path || (now - (cache as any)._stamp) > TTL_MS) {
    const f = loadFile(path);
    cache = { path, mtimeMs: f?.mtimeMs || 0, data: f?.data || {} } as any;
    (cache as any)._stamp = now;
  } else {
    // If file mtime changed, reload
    const st = statSync(path, { throwIfNoEntry: false } as any);
    if (st && st.mtimeMs !== cache.mtimeMs) {
      const f = loadFile(path);
      cache = { path, mtimeMs: f?.mtimeMs || 0, data: f?.data || {} } as any;
      (cache as any)._stamp = now;
    }
  }
  return (cache?.data?.[key]) ?? (fallbackEnv ? process.env[fallbackEnv] : process.env[key]);
}
