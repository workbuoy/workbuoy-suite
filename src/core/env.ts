// src/core/env.ts
export function envBool(name: string, def = false): boolean {
  const v = process.env[name];
  if (v == null) return def;
  return v === '1' || v === 'true' || v === 'TRUE';
}
export function envStr(name: string, def = ''): string {
  const v = process.env[name];
  return v == null ? def : v;
}
