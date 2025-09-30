import { Router } from 'express';
import { z } from 'zod';

const bodySchema = z.object({
  resourceSpans: z.array(z.unknown()).min(1),
});

export type TelemetryExportPayload = z.infer<typeof bodySchema>;

export function createTelemetryRouter(): Router {
  const router = Router();

  router.post('/export', (req, res) => {
    const parsed = bodySchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ error: 'invalid_payload' });
    }

    const accepted = parsed.data.resourceSpans.length;
    return res.status(202).json({ accepted });
  });

  return router;
}
