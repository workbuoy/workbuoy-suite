import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

const TRACE_RE = /^00-([0-9a-f]{32})-([0-9a-f]{16})-[0-9a-f]{2}$/i;

type RequestWithContext = Request & { context?: Record<string, unknown> };

type MutableRequest = RequestWithContext & { context: Record<string, unknown> };

function ensureContext(req: RequestWithContext): MutableRequest {
  if (req.context && typeof req.context === 'object') {
    return req as MutableRequest;
  }

  (req as MutableRequest).context = {};
  return req as MutableRequest;
}

export function trace(req: RequestWithContext, res: Response, next: NextFunction) {
  const traceparent = req.header('traceparent');
  const match = traceparent ? TRACE_RE.exec(traceparent) : null;
  const traceId = match?.[1];
  const context = ensureContext(req).context;

  if (traceId) {
    context.traceId = traceId;
    if (typeof context.reqId !== 'string' || context.reqId.length === 0) {
      context.reqId = traceId;
    }
    res.setHeader('trace-id', traceId);
  } else if (typeof context.reqId !== 'string' || context.reqId.length === 0) {
    context.reqId = randomUUID();
  }

  next();
}
