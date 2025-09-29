// src/middleware/correlationHeader.ts
import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

type RequestWithContext = Request & {
  context?: { traceId?: string; [key: string]: unknown };
  correlationId?: string;
};

const TRACEPARENT_REGEX = /^00-([0-9a-f]{32})-([0-9a-f]{16})-[0-9a-f]{2}$/i;

function parseTraceparent(header: unknown): string | undefined {
  if (typeof header !== 'string') {
    return undefined;
  }

  const trimmed = header.trim();
  if (!trimmed) {
    return undefined;
  }

  const match = TRACEPARENT_REGEX.exec(trimmed);
  if (!match) {
    return undefined;
  }

  return match[1].toLowerCase();
}

export function correlationHeader(req: Request, res: Response, next: NextFunction) {
  const withContext = req as RequestWithContext;
  const cid =
    (req.headers['x-correlation-id'] as string) ||
    (typeof randomUUID === 'function' ? randomUUID() : Math.random().toString(36).slice(2));

  res.setHeader('x-correlation-id', cid);
  withContext.correlationId = cid;

  const traceparent = req.headers['traceparent'];
  const traceId = parseTraceparent(Array.isArray(traceparent) ? traceparent[0] : traceparent);
  if (traceId) {
    const context = { ...(withContext.context ?? {}) };
    context.traceId = traceId;
    withContext.context = context;
    res.setHeader('trace-id', traceId);
  }

  next();
}
