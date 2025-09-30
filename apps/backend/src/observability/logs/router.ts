import { randomUUID } from 'node:crypto';
import type { Request } from 'express';
import { Router } from 'express';
import { z } from 'zod';

const bodySchema = z.object({
  level: z.enum(['info', 'warn', 'error']),
  message: z.string().min(1),
});

type RequestWithContext = Request & { context?: Record<string, unknown> };

function ensureContext(req: RequestWithContext): Record<string, unknown> {
  if (req.context && typeof req.context === 'object') {
    return req.context;
  }

  const context: Record<string, unknown> = {};
  req.context = context;
  return context;
}

function resolveReqId(req: RequestWithContext): string {
  const context = ensureContext(req);
  const existing = context.reqId;

  if (typeof existing === 'string' && existing.length > 0) {
    return existing;
  }

  const generated = randomUUID();
  context.reqId = generated;
  return generated;
}

export type LogIngestPayload = z.infer<typeof bodySchema>;

export function createLogsRouter(): Router {
  const router = Router();

  router.post('/ingest', (req, res) => {
    const parsed = bodySchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ error: 'invalid_payload' });
    }

    const id = randomUUID();
    const ts = new Date().toISOString();
    const reqId = resolveReqId(req as RequestWithContext);

    const payload = parsed.data;
    const logRecord = {
      level: payload.level,
      message: payload.message,
      ts,
      reqId,
    };

    console.log(JSON.stringify(logRecord));

    return res.status(202).json({ id, receivedAt: ts });
  });

  return router;
}
