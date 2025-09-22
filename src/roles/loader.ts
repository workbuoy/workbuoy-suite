import fs from 'node:fs';
import path from 'node:path';
import { RoleProfile, FeatureDef } from './types';
import { defaultFeatures } from './seed/features';

const moduleDir = __dirname;
const repoRoot = path.resolve(moduleDir, '..', '..');

function resolveCandidate(filePath?: string | null): string | null {
  if (!filePath) return null;
  const attempts: string[] = [];
  if (path.isAbsolute(filePath)) {
    attempts.push(filePath);
  } else {
    const workspace = process.env.GITHUB_WORKSPACE;
    const bases = [process.cwd(), repoRoot, moduleDir];
    if (workspace) bases.push(workspace);
    for (const base of bases) {
      attempts.push(path.resolve(base, filePath));
    }
  }
  const seen = new Set<string>();
  for (const candidate of attempts) {
    const normalized = path.normalize(candidate);
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    if (fs.existsSync(normalized)) return normalized;
  }
  return null;
}

function parseLooseJson(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch (initialError) {
    let sanitized = trimmed.replace(/,\s*(\]|\})/g, '$1');
    const arrays = sanitized.match(/\[[\s\S]*?\]/g);
    if (arrays && arrays.length > 1) {
      const merged: unknown[] = [];
      for (const segment of arrays) {
        try {
          const cleaned = segment.replace(/,\s*(\]|\})/g, '$1');
          const parsed = JSON.parse(cleaned);
          if (Array.isArray(parsed)) {
            merged.push(...parsed);
          } else {
            merged.push(parsed);
          }
        } catch {}
      }
      if (merged.length) return merged;
    }
    try {
      return JSON.parse(sanitized);
    } catch {
      throw initialError;
    }
  }
}

function readJson(candidate?: string | null) {
  const resolved = resolveCandidate(candidate);
  if (!resolved) return null;
  try {
    const raw = fs.readFileSync(resolved, 'utf8');
    return parseLooseJson(raw);
  } catch (err) {
    console.warn(`[roles.loader] failed to read ${resolved}:`, err);
    return null;
  }
}

export function loadRolesFromRepo(): RoleProfile[] {
  const candidates = [
    process.env.ROLES_PATH,
    'core/roles/roles.json',
    'roles/roles.json',
    'data/roles.json',
    'src/roles/roles.json',
    'roles.json'
  ];
  for (const candidate of candidates) {
    const json = readJson(candidate) as any;
    if (!json) continue;
    if (Array.isArray(json?.roles)) return json.roles as RoleProfile[];
    if (Array.isArray(json)) return json as RoleProfile[];
  }
  console.warn('[roles.loader] roles.json not found; using empty list');
  return [];
}

export function loadFeaturesFromRepo(): FeatureDef[] {
  const candidates = [
    process.env.FEATURES_PATH,
    'core/roles/features.json',
    'roles/features.json',
    'data/features.json',
    'src/roles/features.json',
    'features.json'
  ];
  for (const candidate of candidates) {
    const json = readJson(candidate) as any;
    if (!json) continue;
    if (Array.isArray(json?.features)) return json.features as FeatureDef[];
    if (Array.isArray(json)) return json as FeatureDef[];
  }
  return defaultFeatures;
}
