import { Router } from 'express';
import { z } from 'zod';
import { isTelemetryEnabled } from '../../config/flags.js';

const telemetryExportSchema = z.object({
  resourceSpans: z.array(z.any()).min(1),
});

export type TelemetryExportPayload = z.infer<typeof telemetryExportSchema>;
export type TelemetryExportHook = (payload: TelemetryExportPayload) => void | Promise<void>;

const telemetryExportHooks = new Set<TelemetryExportHook>();

export function registerTelemetryExportHook(hook: TelemetryExportHook): () => void {
  telemetryExportHooks.add(hook);
  return () => {
    telemetryExportHooks.delete(hook);
  };
}

export function clearTelemetryExportHooks(): void {
  telemetryExportHooks.clear();
}

async function notifyTelemetryExportHooks(payload: TelemetryExportPayload): Promise<void> {
  const hooks = Array.from(telemetryExportHooks);
  await Promise.all(
    hooks.map(async (hook) => {
      try {
        await hook(payload);
      } catch (err) {
        console.warn('[observability] telemetry hook failed', err);
      }
    }),
  );
}

export function createTelemetryRouter(): Router {
  const router = Router();

  router.post('/export', async (req, res) => {
    if (!isTelemetryEnabled()) {
      return res.status(404).json({ error: 'telemetry_disabled' });
    }

    if (!req.is('application/json')) {
      return res.status(415).json({ error: 'content_type_required' });
    }

    const parsed = telemetryExportSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'invalid_payload', details: parsed.error.flatten() });
    }

    const payload = parsed.data;
    await notifyTelemetryExportHooks(payload);
    const accepted = payload.resourceSpans.length;

    return res.status(202).json({ accepted });
  });

  return router;
}
