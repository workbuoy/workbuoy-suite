// scripts/roles-io.ts
import fs from 'node:fs';
import path from 'node:path';
import { defaultFeatures } from '../src/roles/seed/features.ts';

const DEFAULT_FEATURE_SOURCE = 'src/roles/seed/features.ts (defaultFeatures export)';

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

export function resolveRolesSource(): LoadResult<any> {
  const envOverride = process.env.ROLES_PATH;
  const candidates = normalizeCandidates(envOverride, [
    path.join('core', 'roles', 'roles.json'),
  ]);
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
  throw new Error(`Could not locate roles.json. Checked: ${candidates.join(', ')}`);
}

export function resolveFeaturesSource(): LoadResult<any> {
  const envOverride = process.env.FEATURES_PATH;
  const candidates = normalizeCandidates(envOverride, [
    path.join('core', 'roles', 'features.json'),
  ]);
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
  return { data: defaultFeatures as any[], path: DEFAULT_FEATURE_SOURCE };
}

export function loadRolesFromRepo(): any[] {
  return resolveRolesSource().data;
}

export function loadFeaturesFromRepo(): any[] {
  return resolveFeaturesSource().data;
}

export { DEFAULT_FEATURE_SOURCE };
