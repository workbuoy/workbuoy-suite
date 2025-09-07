export type AppErrorCode =
  | 'POLICY_DENY'
  | 'POLICY_DEGRADE'
  | 'VALIDATION'
  | 'NOT_FOUND'
  | 'INTEGRATION'
  | 'RATE_LIMIT'
  | 'UNEXPECTED';

export interface AppErrorJSON {
  name: 'AppError';
  code: AppErrorCode;
  message: string;
  httpStatus?: number;
  correlationId?: string;
  context?: Record<string, unknown>;
}

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly httpStatus?: number;
  readonly correlationId?: string;
  readonly context?: Record<string, unknown>;

  constructor(
    code: AppErrorCode,
    message: string,
    opts: { httpStatus?: number; correlationId?: string; context?: Record<string, unknown> } = {}
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.httpStatus = opts.httpStatus;
    this.correlationId = opts.correlationId;
    this.context = opts.context;
    Error.captureStackTrace?.(this, AppError);
  }

  toJSON(): AppErrorJSON {
    return {
      name: 'AppError',
      code: this.code,
      message: this.message,
      httpStatus: this.httpStatus,
      correlationId: this.correlationId,
      context: this.context,
    };
  }
}
