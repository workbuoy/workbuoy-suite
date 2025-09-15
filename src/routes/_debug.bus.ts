// src/routes/_debug.bus.ts
import type { Request, Response } from 'express';
import { bus } from '../core/eventBusV2';
export async function debugBusHandler(_req: Request, res: Response) {
  try { res.json(await bus.stats()); }
  catch (e:any) { res.status(500).json({ error: 'bus_stats_failed', message: e?.message || String(e) }); }
}
