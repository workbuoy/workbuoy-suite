import { startedAtISO } from './runtimeState';

import type { HealthResponse } from './types';

const GIT_SHA =
  process.env.GIT_SHA ||
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.HEROKU_SLUG_COMMIT ||
  'unknown';
const BUILD_ID = process.env.BUILD_ID || process.env.VERCEL_BUILD_ID || undefined;

export function getHealth(): HealthResponse {
  const uptime_s = Number(process.uptime());
  const status: HealthResponse['status'] = 'ok';
  return {
    status,
    uptime_s,
    git_sha: String(GIT_SHA),
    build_id: BUILD_ID,
    started_at: startedAtISO,
  };
}
