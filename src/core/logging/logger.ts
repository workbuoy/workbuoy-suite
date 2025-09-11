import { maskValue } from '../security/pii';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  component: string;
  message: string;
  correlationId?: string;
  metadata?: Record<string, unknown>;
  piiMasked: boolean;
}

export function log(
  level: LogLevel,
  component: string,
  message: string,
  meta: Record<string, unknown> = {},
  correlationId?: string
): void {
  function mask(obj: any): any {
    if (typeof obj === 'string') {
      return maskValue(obj);
    } else if (Array.isArray(obj)) {
      return obj.map((v) => mask(v));
    } else if (obj && typeof obj === 'object') {
      const result: any = {};
      for (const key of Object.keys(obj)) {
        result[key] = mask((obj as any)[key]);
      }
      return result;
    }
    return obj;
  }

  const maskedMeta = mask(meta);
  const maskedMessage = maskValue(message);
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    component,
    message: maskedMessage,
    correlationId,
    metadata: maskedMeta,
    piiMasked:
      maskedMessage !== message ||
      JSON.stringify(maskedMeta) !== JSON.stringify(meta),
  };
  console.log(JSON.stringify(entry));
}
