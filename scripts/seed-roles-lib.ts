// scripts/seed-roles-lib.ts
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

async function dynamic(p) {
  return (await import(p));
}

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(moduleDir, '..');

function resolveFilePath(filePath) {
  if (!filePath) return null;
  const attempts = [];
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
  const seen = new Set();
  for (const candidate of attempts) {
    const normalized = path.normalize(candidate);
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    if (fs.existsSync(normalized)) return normalized;
  }
  return null;
}

function parseLooseJson(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch (initialError) {
    let sanitized = trimmed.replace(/,\s*(\]|\})/g, '$1');
    const arrays = sanitized.match(/\[[\s\S]*?\]/g);
    if (arrays && arrays.length > 1) {
      const merged = [];
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

function loadJSONFromCandidate(candidate) {
  if (!candidate) return null;
  const resolved = resolveFilePath(candidate);
  if (!resolved) return null;
  try {
    const raw = fs.readFileSync(resolved, 'utf8');
    return parseLooseJson(raw);
  } catch (err) {
    console.warn(`[seed-roles] failed to load ${resolved}:`, err);
    return null;
  }
}

export function loadJSON(filePath) {
  const resolved = resolveFilePath(filePath);
  if (!resolved) throw new Error(`Missing file: ${filePath}`);
  const raw = fs.readFileSync(resolved, 'utf8');
  const parsed = parseLooseJson(raw);
  if (parsed === null) throw new Error(`Missing file: ${resolved}`);
  return parsed;
}

export function loadRolesFromRepo() {
  const rolesPathCandidates = [
    process.env.ROLES_PATH,
    'core/roles/roles.json',
    'roles/roles.json',
    'backend/roles/roles.json',
    'data/roles.json'
  ];
  for (const candidate of rolesPathCandidates) {
    const json = loadJSONFromCandidate(candidate);
    if (!json) continue;
    if (Array.isArray(json?.roles)) return json.roles;
    if (Array.isArray(json)) return json;
  }
  throw new Error('Could not locate roles.json');
}

export function loadFeaturesFromRepo() {
  const featureCandidates = [
    process.env.FEATURES_PATH,
    'core/roles/features.json',
    'roles/features.json',
    'backend/roles/features.json',
    'data/features.json'
  ];
  for (const candidate of featureCandidates) {
    const json = loadJSONFromCandidate(candidate);
    if (!json) continue;
    if (Array.isArray(json?.features)) return json.features;
    if (Array.isArray(json)) return json;
  }
  return [];
}

export async function seedRoles() {
  if ((process.env.FF_PERSISTENCE || '').toLowerCase() !== 'true') {
    return { ok: true, skipped: 'FF_PERSISTENCE=false' };
  }
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set when FF_PERSISTENCE=true');
  }
  const roles = loadRolesFromRepo();
  const features = loadFeaturesFromRepo();

  // Try JS then TS module path for importer
  let importer;
  try {
    importer = await dynamic('../src/roles/service/importer.js');
  } catch {
    importer = await dynamic('../src/roles/service/importer.ts');
  }
  const { importRolesAndFeatures } = importer;
  const summary = await importRolesAndFeatures(roles, features);
  return summary ?? { roles: roles.length, features: features.length };
}
