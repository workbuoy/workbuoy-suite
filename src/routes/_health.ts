// src/routes/_health.ts
import type { Request, Response } from 'express';
import { bus } from '../core/eventBusV2';

export async function healthHandler(_req: Request, res: Response) {
  try {
    const stats = await bus.stats();
    const dlqCount = (stats.summary?.dlq ?? (stats.dlq || []).length);
    res.json({
      ok: true,
      uptime: process.uptime(),
      queues: stats.queues || [],
      dlqCount
    });
  } catch (e:any) {
    res.status(200).json({ ok: true, uptime: process.uptime(), queues: [], dlqCount: 0 });
  }
}
