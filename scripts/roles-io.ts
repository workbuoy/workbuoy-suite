// scripts/roles-io.ts
import fs from 'node:fs';
import path from 'node:path';
import { defaultFeatures } from '../apps/backend/src/roles/seed/features.ts';

const DEFAULT_FEATURE_SOURCE =
  'apps/backend/src/roles/seed/features.ts (defaultFeatures export)';
const FALLBACK_ROLES_PATH = path.resolve(__dirname, 'fixtures', 'minimal-roles.json');
const FALLBACK_FEATURES_PATH = path.resolve(__dirname, 'fixtures', 'minimal-features.json');

type JsonCandidate = unknown;

type LoadResult<T> = {
  data: T[];
  path: string;
};

class JsonParseError extends Error {
  constructor(filePath: string, original: unknown) {
    const details = original instanceof Error ? original.message : String(original);
    super(`parse error for ${filePath}: ${details}`);
    this.name = 'JsonParseError';
  }
}

function strictRolesEnabled(): boolean {
  return (process.env.FF_STRICT_ROLES || '').toLowerCase() === 'true';
}

function normalizeCandidates(envPath: string | undefined, fallbacks: string[]): string[] {
  const list: string[] = [];
  if (envPath && envPath.trim()) {
    list.push(envPath.trim());
  }
  list.push(...fallbacks);

  const seen = new Set<string>();
  const deduped: string[] = [];
  for (const entry of list) {
    const normalized = entry.trim();
    if (!normalized) continue;
    const key = path.normalize(normalized);
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(normalized);
  }
  return deduped;
}

function resolvePath(candidate: string): string {
  if (path.isAbsolute(candidate)) return candidate;
  return path.resolve(process.cwd(), candidate);
}

function loadJSON(filePath: string): JsonCandidate {
  const abs = resolvePath(filePath);
  if (!fs.existsSync(abs)) {
    throw new Error(`Missing file: ${abs}`);
  }
  const raw = fs.readFileSync(abs, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new JsonParseError(abs, err);
  }
}

function tryLoadList(candidatePaths: string[], key: 'roles' | 'features'): LoadResult<any> | null {
  for (const candidate of candidatePaths) {
    const abs = resolvePath(candidate);
    if (!fs.existsSync(abs)) continue;
    try {
      const json = loadJSON(candidate) as any;
      if (Array.isArray(json)) {
        return { data: json, path: abs };
      }
      if (Array.isArray(json?.[key])) {
        return { data: json[key], path: abs };
      }
    } catch (err) {
      if (err instanceof JsonParseError) {
        throw err;
      }
      console.warn(`[roles-io] Failed to load ${abs}:`, err);
    }
  }
  return null;
}

function fallbackFromParseError(kind: 'roles' | 'features', error: JsonParseError): LoadResult<any> {
  const label = kind === 'roles' ? 'roles' : 'features';
  const fallbackPath = kind === 'roles' ? FALLBACK_ROLES_PATH : FALLBACK_FEATURES_PATH;
  console.error(`[roles-io] JsonParseError: ${error.message}`);
  if (strictRolesEnabled()) {
    console.error('[roles-io] FF_STRICT_ROLES=true, aborting instead of using fallback dataset.');
    throw error;
  }
  console.warn(`[roles-io] Falling back to minimal ${label} dataset at ${fallbackPath}`);
  const fallback = loadJSON(fallbackPath) as any[];
  return { data: fallback, path: fallbackPath };
}

export function resolveRolesSource(): LoadResult<any> {
  const envOverride = process.env.ROLES_PATH;
  const candidates = normalizeCandidates(envOverride, [
    path.join('core', 'roles', 'roles.json'),
    path.join('roles', 'roles.json'),
    path.join('apps', 'backend', 'roles', 'roles.json'),
    path.join('data', 'roles.json'),
  ]);
  try {
    const loaded = tryLoadList(candidates, 'roles');
    if (loaded) {
      if (envOverride && envOverride.trim()) {
        const envPath = resolvePath(envOverride.trim());
        if (path.resolve(loaded.path) === envPath) {
          console.log(`[roles-io] Using ROLES_PATH override: ${loaded.path}`);
        }
      }
      return loaded;
    }
  } catch (err) {
    if (err instanceof JsonParseError) {
      return fallbackFromParseError('roles', err);
    }
    throw err;
  }
  throw new Error(`Could not locate roles.json. Checked: ${candidates.join(', ')}`);
}

export function resolveFeaturesSource(): LoadResult<any> {
  const envOverride = process.env.FEATURES_PATH;
  const candidates = normalizeCandidates(envOverride, [
    path.join('core', 'roles', 'features.json'),
    path.join('roles', 'features.json'),
    path.join('apps', 'backend', 'roles', 'features.json'),
    path.join('data', 'features.json'),
  ]);
  try {
    const loaded = tryLoadList(candidates, 'features');
    if (loaded) {
      if (envOverride && envOverride.trim()) {
        const envPath = resolvePath(envOverride.trim());
        if (path.resolve(loaded.path) === envPath) {
          console.log(`[roles-io] Using FEATURES_PATH override: ${loaded.path}`);
        }
      }
      return loaded;
    }
  } catch (err) {
    if (err instanceof JsonParseError) {
      return fallbackFromParseError('features', err);
    }
    throw err;
  }
  return { data: defaultFeatures as any[], path: DEFAULT_FEATURE_SOURCE };
}

export function loadRolesFromRepo(): any[] {
  return resolveRolesSource().data;
}

export function loadFeaturesFromRepo(): any[] {
  return resolveFeaturesSource().data;
}

export { DEFAULT_FEATURE_SOURCE };
