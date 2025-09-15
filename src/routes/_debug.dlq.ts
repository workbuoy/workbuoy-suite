// src/routes/_debug.dlq.ts
import type { Request, Response } from 'express';
import { bus } from '../core/eventBusV2';
export async function debugDlqHandler(_req: Request, res: Response) {
  try {
    const s = await bus.stats();
    res.json({ dlq: s.dlq ?? [] });
  } catch (e:any) {
    res.status(500).json({ error: 'dlq_stats_failed', message: e?.message || String(e) });
  }
}
