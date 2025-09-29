import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { isLoggingEnabled } from '../../config/flags.js';

const logIngestSchema = z.object({
  level: z.enum(['info', 'warn', 'error']),
  message: z.string().min(1),
  context: z.unknown().optional(),
  timestamp: z.string().optional(),
});

export type LogIngestPayload = z.infer<typeof logIngestSchema>;
export type LogIngestHook = (payload: LogIngestPayload) => void | Promise<void>;

const logIngestHooks = new Set<LogIngestHook>();

export function registerLogIngestHook(hook: LogIngestHook): () => void {
  logIngestHooks.add(hook);
  return () => {
    logIngestHooks.delete(hook);
  };
}

export function clearLogIngestHooks(): void {
  logIngestHooks.clear();
}

async function notifyLogIngestHooks(payload: LogIngestPayload): Promise<void> {
  const hooks = Array.from(logIngestHooks);
  await Promise.all(
    hooks.map(async (hook) => {
      try {
        await hook(payload);
      } catch (err) {
        console.warn('[observability] log hook failed', err);
      }
    }),
  );
}

function hasUtf8JsonContentType(contentType: unknown): boolean {
  if (typeof contentType !== 'string') {
    return false;
  }

  const normalized = contentType.toLowerCase();
  if (!normalized.includes('application/json')) {
    return false;
  }

  return normalized.includes('charset=utf-8');
}

export function createLogsRouter(): Router {
  const router = Router();

  router.post('/ingest', async (req, res) => {
    if (!isLoggingEnabled()) {
      return res.status(404).json({ error: 'logging_disabled' });
    }

    if (!hasUtf8JsonContentType(req.headers['content-type'])) {
      return res.status(415).json({ error: 'content_type_required' });
    }

    const parsed = logIngestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'invalid_payload', details: parsed.error.flatten() });
    }

    const payload = parsed.data;
    await notifyLogIngestHooks(payload);

    const id = randomUUID();
    const receivedAt = new Date().toISOString();

    return res.status(202).json({ id, receivedAt });
  });

  return router;
}
