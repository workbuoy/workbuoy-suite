export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogMeta {
  correlationId?: string;
  [key: string]: any;
}

export function log(level: LogLevel, message: string, meta: LogMeta = {}): void {
  const correlationId = meta.correlationId || 'unknown';
  const logMessage = `[${correlationId}] ${message}`;
  // In a real implementation, this would integrate with a structured logger
  switch (level) {
    case 'debug':
      console.debug(logMessage, meta);
      break;
    case 'info':
      console.info(logMessage, meta);
      break;
    case 'warn':
      console.warn(logMessage, meta);
      break;
    case 'error':
      console.error(logMessage, meta);
      break;
  }
}
