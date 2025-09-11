import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors";
import { logger } from "../logger";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const correlationId = req.correlationId;
  if (err instanceof AppError) {
    logger.error("app_error", { correlationId, code: (err as any).code, details: (err as any).details, stack: (err as any).stack });
    return res.status((err as any).statusCode || 500).json({
      error: { message: (err as any).message, code: (err as any).code, details: (err as any).details },
      correlationId,
    });
  }
  const anyErr = err as any;
  logger.error("unhandled_error", { correlationId, err: { message: anyErr?.message, stack: anyErr?.stack } });
  return res.status(500).json({
    error: { message: "Internal Server Error" },
    correlationId,
  });
}
