export type AppErrorCode =
  | "E_POLICY_DENIED"
  | "E_VALIDATION"
  | "E_INTEGRATION"
  | "E_RATE_LIMIT"
  | "E_NOT_FOUND"
  | "E_UNAUTHORIZED"
  | "E_UNKNOWN";

export class AppError extends Error {
  code: AppErrorCode;
  status: number;
  meta?: Record<string, any>;
  constructor(code: AppErrorCode, message: string, status = 400, meta?: Record<string, any>) {
    super(message);
    this.code = code;
    this.status = status;
    this.meta = meta;
  }
}

export function toHttp(err: unknown): { status: number; body: any } {
  if (err instanceof AppError) {
    return {
      status: err.status,
      body: { error: err.code, message: err.message, ...(err.meta ? { meta: err.meta } : {}) },
    };
  }
  return { status: 500, body: { error: "E_UNKNOWN", message: (err as any)?.message || "unknown" } };
}
