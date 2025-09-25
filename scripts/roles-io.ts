// scripts/roles-io.ts
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

import { embeddedMinimalFeatures, embeddedMinimalRoles } from './fixtures/embedded.ts';

type LoadResult<T> = {
  data: T[];
  path: string;
};

type DataKey = 'roles' | 'features';

function strictRolesEnabled(): boolean {
  return (process.env.FF_STRICT_ROLES || '').toLowerCase() === 'true';
}

function findRepoRoot(): string {
  let current = process.cwd();
  while (true) {
    if (fs.existsSync(path.join(current, '.git'))) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }
  return process.cwd();
}

const repoRoot = findRepoRoot();
const requireFromHere = createRequire(import.meta.url);

function resolveDataPackage(kind: DataKey): string | null {
  const suffix = kind === 'roles' ? 'roles.json' : 'features.json';
  try {
    return requireFromHere.resolve(`@workbuoy/roles-data/${suffix}`);
  } catch {
    return null;
  }
}

function resolveCandidate(candidate: string | null | undefined): string | null {
  if (!candidate) return null;
  if (path.isAbsolute(candidate)) return path.normalize(candidate);
  return path.resolve(repoRoot, candidate);
}

function dedupeCandidates(candidates: (string | null | undefined)[]): string[] {
  const seen = new Set<string>();
  const resolved: string[] = [];
  for (const candidate of candidates) {
    const abs = resolveCandidate(candidate);
    if (!abs) continue;
    const key = path.normalize(abs);
    if (seen.has(key)) continue;
    seen.add(key);
    resolved.push(abs);
  }
  return resolved;
}

function tryLoadJson(candidate: string): any | null {
  if (!fs.existsSync(candidate)) {
    return null;
  }
  const raw = fs.readFileSync(candidate, 'utf8');
  return JSON.parse(raw);
}

function ensureArray(json: any, key: DataKey): any[] | null {
  if (Array.isArray(json)) return json;
  if (json && Array.isArray(json[key])) return json[key];
  return null;
}

function logParseError(candidate: string, err: unknown): void {
  const message = err instanceof Error ? err.message : String(err);
  console.warn(`[roles-io] failed to parse ${candidate}: ${message}`);
}

function embeddedFallback(kind: DataKey): LoadResult<any> {
  if (strictRolesEnabled()) {
    throw new Error(`FF_STRICT_ROLES=true, unable to resolve ${kind} dataset`);
  }
  if (kind === 'roles') {
    console.warn('[roles-io] no roles.json found; using embeddedMinimalRoles');
    return {
      data: embeddedMinimalRoles.map((entry) => ({ ...entry })),
      path: '<embedded>',
    };
  }
  console.warn('[roles-io] no features.json found; using embeddedMinimalFeatures');
  return {
    data: embeddedMinimalFeatures.map((entry) => ({ ...entry })),
    path: '<embedded>',
  };
}

function resolveSource(kind: DataKey): LoadResult<any> {
  const envVar = kind === 'roles' ? process.env.ROLES_PATH : process.env.FEATURES_PATH;
  const envCandidate = resolveCandidate(envVar ?? undefined);

  const packageCandidate = resolveDataPackage(kind);
  const fileName = kind === 'roles' ? 'roles.json' : 'features.json';
  const candidates = dedupeCandidates([
    envCandidate,
    packageCandidate,
    path.join(repoRoot, 'packages/roles-data', fileName),
  ]);

  for (const candidate of candidates) {
    try {
      const json = tryLoadJson(candidate);
      if (!json) continue;
      const data = ensureArray(json, kind);
      if (!data) continue;
      if (envCandidate && path.resolve(candidate) === path.resolve(envCandidate)) {
        console.log(`[roles-io] Using ${kind === 'roles' ? 'ROLES_PATH' : 'FEATURES_PATH'} override: ${candidate}`);
      }
      return { data, path: candidate };
    } catch (err) {
      logParseError(candidate, err);
      continue;
    }
  }

  return embeddedFallback(kind);
}

export function resolveRolesSource(): LoadResult<any> {
  return resolveSource('roles');
}

export function resolveFeaturesSource(): LoadResult<any> {
  return resolveSource('features');
}

export function loadRolesFromRepo(): any[] {
  return resolveRolesSource().data;
}

export function loadFeaturesFromRepo(): any[] {
  return resolveFeaturesSource().data;
}
