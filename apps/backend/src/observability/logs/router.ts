import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';

const bodySchema = z.object({
  level: z.enum(['info', 'warn', 'error']),
  message: z.string().min(1),
});

export type LogIngestPayload = z.infer<typeof bodySchema>;

export function createLogsRouter(): Router {
  const router = Router();

  router.post('/ingest', (req, res) => {
    const parsed = bodySchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ error: 'invalid_payload' });
    }

    const id = randomUUID();
    const receivedAt = new Date().toISOString();

    return res.status(202).json({ id, receivedAt });
  });

  return router;
}
