// src/routes/_debug.bus.ts
import type { Request, Response } from 'express';
import { bus } from '../core/eventBusV2';

export async function debugBusHandler(_req: Request, res: Response) {
  try {
    const { summary, queues, dlq } = await bus.stats();
    res.json({ summary, queues, dlq });
  }
  catch (e:any) {
    res.json({
      summary: { high: 0, medium: 0, low: 0, dlq: 0 },
      queues: [],
      dlq: [],
      error: e?.message || String(e)
    });
  }
}
