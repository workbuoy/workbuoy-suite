
import fs from 'fs';
import path from 'path';
import { maskPII } from './maskPII';

type Level = 'debug'|'info'|'warn'|'error';
const LOG_FILE = process.env.WB_LOG_FILE || path.join(process.cwd(), 'workbuoy.log');

function write(fields: Record<string, any>) {
  const rec = { ts: new Date().toISOString(), ...fields };
  const line = JSON.stringify(rec);
  try { fs.appendFileSync(LOG_FILE, line + '\n', 'utf8'); } catch {}
  // dev stdout
  console.log(line);
}

export function log(level: Level, msg: string, fields: Record<string, any> = {}) {
  const safe: Record<string, any> = {};
  for (const [k,v] of Object.entries(fields)) safe[k] = typeof v === 'string' ? maskPII(v) : v;
  write({ level, msg, ...safe });
}

export function requestLogger() {
  return (req: any, _res: any, next: any) => {
    const wb = req.wb || {};
    log('info', 'http_request', {
      method: req.method,
      url: req.originalUrl || req.url,
      correlationId: wb.correlationId,
      roleId: wb.roleId,
      autonomyLevel: wb.autonomyLevel
    });
    next();
  };
}
