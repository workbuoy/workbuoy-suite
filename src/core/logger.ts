export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogMeta {
  correlationId?: string;
  [key: string]: any;
}

/**
 * Basic logger that writes structured messages to the console.
 */
export function log(level: LogLevel, message: string, meta: LogMeta = {}): void {
  const timestamp = new Date().toISOString();
  const { correlationId, ...rest } = meta;
  const metaString = Object.keys(rest).length ? JSON.stringify(rest) : '';
  // eslint-disable-next-line no-console
  console.log(`[${timestamp}] [${level}] ${correlationId ?? '-'}` +
    ` ${message}`, metaString);
}
