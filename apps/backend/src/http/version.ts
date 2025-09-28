import type { Request, Response } from 'express';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

// Load apps/backend/package.json
// NodeNext + ESM: use createRequire to read JSON synchronously.
const pkg = require('../../package.json');

export function versionHandler(_req: Request, res: Response) {
  const version: string = pkg?.version ?? '0.0.0';
  const commit: string = process.env.GIT_SHA ?? 'unknown';

  res.status(200).json({
    version,
    commit,
    node: process.version,
    pid: process.pid,
    uptimeSec: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
}
