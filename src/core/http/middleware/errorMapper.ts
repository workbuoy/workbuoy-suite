import type { Request, Response, NextFunction } from "express";
import { toHttp } from "../../errors/AppError";

export function errorMapper(err: any, _req: Request, res: Response, _next: NextFunction) {
  const { status, body } = toHttp(err);
  res.status(status).json(body);
}
