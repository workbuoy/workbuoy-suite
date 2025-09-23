import type { VersionResponse } from './types';

const SEMVER = process.env.SEMVER || process.env.npm_package_version || '0.0.0';
const GIT_SHA =
  process.env.GIT_SHA ||
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.HEROKU_SLUG_COMMIT ||
  'unknown';
const BUILT_AT = process.env.BUILT_AT || new Date().toISOString();
const COMMIT_TIME = process.env.COMMIT_TIME;

export function getVersion(): VersionResponse {
  return {
    semver: String(SEMVER),
    git_sha: String(GIT_SHA),
    built_at: String(BUILT_AT),
    ...(COMMIT_TIME ? { commit_time: String(COMMIT_TIME) } : {}),
  };
}
