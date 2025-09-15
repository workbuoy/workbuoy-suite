import type { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  status: number;
  code?: string;
  explanations?: any[];
  constructor(status: number, message: string, code?: string, explanations?: any[]) {
    super(message);
    this.status = status;
    this.code = code;
    this.explanations = explanations;
  }
}

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = err?.status || 500;
  const body: any = { error: err?.message || 'Internal Error' };
  if (err?.code) body.code = err.code;
  if (err?.explanations) body.explanations = err.explanations;
  res.status(status).json(body);
}
