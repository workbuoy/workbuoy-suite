// src/core/logging/maskValue.ts
export function maskValue(v:any): any {
  if (typeof v !== 'string') return v;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}/i.test(v)) return '<uuid>';
  if (/@/.test(v)) return '<email>';
  if (/^\+?\d{6,}$/.test(v)) return '<phone>';
  return v.length > 12 ? v.slice(0,4) + '…' : v;
}
