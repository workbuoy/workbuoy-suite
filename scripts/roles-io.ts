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

function normalizeCandidates(envPath: string | undefined, fallbacks: string[]): string[] {
  const list: string[] = [];
  if (envPath && envPath.trim()) {
    list.push(envPath.trim());
  }
  for (const candidate of fallbacks) {
    list.push(candidate);
  }
  return list;
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
  return JSON.parse(raw);
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
      console.warn(`[roles-io] Failed to parse ${abs}:`, err);
    }
  }
  return null;
}

export function resolveRolesSource(): LoadResult<any> {
  const candidates = normalizeCandidates(process.env.ROLES_PATH, [
    path.join('core', 'roles', 'roles.json'),
    path.join('roles', 'roles.json'),
    path.join('backend', 'roles', 'roles.json'),
    path.join('data', 'roles.json'),
  ]);
  const loaded = tryLoadList(candidates, 'roles');
  if (loaded) return loaded;
  throw new Error(`Could not locate roles.json. Checked: ${candidates.join(', ')}`);
}

export function resolveFeaturesSource(): LoadResult<any> {
  const candidates = normalizeCandidates(process.env.FEATURES_PATH, [
    path.join('core', 'roles', 'features.json'),
    path.join('roles', 'features.json'),
    path.join('backend', 'roles', 'features.json'),
    path.join('data', 'features.json'),
  ]);
  const loaded = tryLoadList(candidates, 'features');
  if (loaded) return loaded;
  return { data: defaultFeatures as any[], path: DEFAULT_FEATURE_SOURCE };
}

export function loadRolesFromRepo(): any[] {
  return resolveRolesSource().data;
}

export function loadFeaturesFromRepo(): any[] {
  return resolveFeaturesSource().data;
}

export { DEFAULT_FEATURE_SOURCE };
