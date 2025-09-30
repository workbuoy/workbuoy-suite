import fs from 'fs';
import { maskPII } from './maskPII';

export type Level = 'debug'|'info'|'warn'|'error';
export type LogFields = Record<string, any> & { correlationId?: string };

const LOG_FILE = process.env.WB_LOG_FILE;

function write(fields: Record<string, any>) {
  const rec = { ts: new Date().toISOString(), ...fields };
  const line = JSON.stringify(rec);
  if (LOG_FILE) {
    try { fs.appendFileSync(LOG_FILE, line + '\n', 'utf8'); } catch {}
  }
  // dev stdout
  console.log(line);
}

function sanitise(fields: LogFields = {}) {
  const safe: Record<string, any> = {};
  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined) continue;
    safe[k] = typeof v === 'string' ? maskPII(v) : v;
  }
  return safe;
}

export function log(level: Level, msg: string, fields: LogFields = {}, correlationId?: string) {
  const { correlationId: fieldCorrelationId, ...rest } = fields || {};
  const safe = sanitise(rest);
  const corr = correlationId || (typeof fieldCorrelationId === 'string' ? fieldCorrelationId : undefined);
  if (corr) safe.correlationId = corr;
  write({ level, msg, ...safe });
}

function pickCorrelation(...values: Array<unknown>): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.length) return value;
  }
  return undefined;
}

type StructuredFields = LogFields & { msg?: string; message?: string };

function normaliseArgs(level: Level, args: any[]): [string, LogFields, string | undefined] {
  const [first, second, third] = args;
  if (typeof first === 'string') {
    const fields = (second && typeof second === 'object' && !Array.isArray(second)) ? { ...(second as LogFields) } : {};
    const { correlationId: fromFields, ...rest } = fields as StructuredFields;
    const correlationId = pickCorrelation(third, typeof second === 'string' ? second : undefined, fromFields);
    return [first, rest, correlationId];
  }

  const record: StructuredFields = (first && typeof first === 'object' && !Array.isArray(first))
    ? { ...(first as StructuredFields) }
    : {};
  const { msg, message, correlationId: fromRecord, ...rest } = record;
  const extra = (second && typeof second === 'object' && !Array.isArray(second)) ? { ...(second as LogFields) } : {};
  const { correlationId: fromExtra, ...extraRest } = extra as StructuredFields;
  const messageText = typeof msg === 'string' ? msg : typeof message === 'string' ? message : level;
  const correlationId = pickCorrelation(third, typeof second === 'string' ? second : undefined, fromRecord, fromExtra);
  return [messageText, { ...rest, ...extraRest }, correlationId];
}

type LoggerMethod = (...args: any[]) => void;

function createMethod(level: Level): LoggerMethod {
  return (...args: any[]) => {
    const [msg, fields, correlationId] = normaliseArgs(level, args);
    log(level, msg, fields, correlationId);
  };
}

export const logger = {
  debug: createMethod('debug'),
  info: createMethod('info'),
  warn: createMethod('warn'),
  error: createMethod('error'),
};

export default logger;

export function requestLogger() {
  return (req: any, _res: any, next: any) => {
    const wb = req.wb || {};
    const correlationId = wb.correlationId || req.correlationId;
    log('info', 'http_request', {
      method: req.method,
      url: req.originalUrl || req.url,
      roleId: wb.roleId,
      autonomyLevel: wb.autonomyLevel
    }, correlationId);
    next();
  };
}
