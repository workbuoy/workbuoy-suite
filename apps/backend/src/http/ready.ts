import type { Request, Response } from 'express';

function isChaos(): boolean {
  return process.env.WB_CHAOS_READY === '1';
}

/**
 * Ready returns 200 when service is considered ready.
 * In later PRs, expand with DB ping when FF_PERSISTENCE/DB enabled.
 */
export async function readyHandler(_req: Request, res: Response) {
  if (isChaos()) {
    return res.status(503).json({ ready: false, reason: 'chaos' });
  }
  return res.status(200).json({ ready: true });
}
