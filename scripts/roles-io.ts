// scripts/roles-io.ts
import fs from 'node:fs';
import path from 'node:path';

export interface FileLoadResult<T> {
  data: T;
  path?: string;
}

const ROLE_CANDIDATES = [
  'core/roles/roles.json',
  'roles/roles.json',
  'backend/roles/roles.json',
  'data/roles.json',
];

const FEATURE_CANDIDATES = [
  'core/roles/features.json',
  'roles/features.json',
  'backend/roles/features.json',
  'data/features.json',
];

const SKIP_DIRS = new Set([
  '.git',
  '.next',
  '.turbo',
  'build',
  'coverage',
  'dist',
  'node_modules',
  'out',
  'tmp',
]);

export function loadJSON(filePath: string) {
  const abs = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(abs)) throw new Error(`Missing file: ${abs}`);
  const raw = fs.readFileSync(abs, 'utf8');
  return JSON.parse(raw);
}

function getSearchBases(): string[] {
  const bases: string[] = [];
  let dir = process.cwd();
  for (let i = 0; i < 3; i += 1) {
    if (!bases.includes(dir)) bases.push(dir);
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return bases;
}

function toRelative(absPath: string): string {
  const cwd = process.cwd();
  const rel = path.relative(cwd, absPath);
  return rel && !rel.startsWith('..') ? rel : absPath;
}

function extractList(json: any, key: string): any[] | undefined {
  if (Array.isArray(json)) {
    return json;
  }
  if (json && typeof json === 'object' && Array.isArray(json[key])) {
    return json[key] as any[];
  }
  return undefined;
}

function resolveCandidate(candidate: string): string | undefined {
  if (!candidate) return undefined;
  const attempts = new Set<string>();
  if (path.isAbsolute(candidate)) {
    attempts.add(candidate);
  } else {
    for (const base of getSearchBases()) {
      attempts.add(path.resolve(base, candidate));
    }
  }
  for (const attempt of attempts) {
    try {
      const stat = fs.statSync(attempt);
      if (stat.isFile()) {
        return attempt;
      }
    } catch {}
  }
  return undefined;
}

function searchRepoFor(fileName: string): string | undefined {
  const queue: string[] = [...new Set(getSearchBases())];
  const visited = new Set<string>();

  while (queue.length) {
    const dir = queue.shift()!;
    if (visited.has(dir)) continue;
    visited.add(dir);

    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isFile() && entry.name === fileName) {
        return fullPath;
      }
      if (entry.isDirectory() && !SKIP_DIRS.has(entry.name)) {
        queue.push(fullPath);
      }
    }
  }
  return undefined;
}

function loadUsingEnv(envVar: 'ROLES_PATH' | 'FEATURES_PATH', key: string): FileLoadResult<any[]> | undefined {
  const override = process.env[envVar];
  if (!override) return undefined;
  const resolved = resolveCandidate(override);
  if (!resolved) {
    throw new Error(`${envVar} points to missing file: ${override}`);
  }
  const data = extractList(loadJSON(resolved), key);
  if (!data) {
    throw new Error(`${envVar} must reference a JSON array or object containing '${key}'`);
  }
  return { data, path: toRelative(resolved) };
}

function loadUsingCandidates(candidates: string[], key: string): FileLoadResult<any[]> | undefined {
  for (const candidate of candidates) {
    const resolved = resolveCandidate(candidate);
    if (!resolved) continue;
    try {
      const data = extractList(loadJSON(resolved), key);
      if (data) {
        return { data, path: toRelative(resolved) };
      }
    } catch {
      // ignore and continue to next candidate
    }
  }
  return undefined;
}

function loadBySearch(fileName: string, key: string): FileLoadResult<any[]> | undefined {
  const found = searchRepoFor(fileName);
  if (!found) return undefined;
  const data = extractList(loadJSON(found), key);
  if (!data) return undefined;
  return { data, path: toRelative(found) };
}

export function loadRolesFromRepo(): FileLoadResult<any[]> {
  const envResult = loadUsingEnv('ROLES_PATH', 'roles');
  if (envResult) return envResult;

  const candidateResult = loadUsingCandidates(ROLE_CANDIDATES, 'roles');
  if (candidateResult) return candidateResult;

  const searched = loadBySearch('roles.json', 'roles');
  if (searched) return searched;

  throw new Error('Could not locate roles.json');
}

export function loadFeaturesFromRepo(): FileLoadResult<any[]> {
  const envResult = loadUsingEnv('FEATURES_PATH', 'features');
  if (envResult) return envResult;

  const candidateResult = loadUsingCandidates(FEATURE_CANDIDATES, 'features');
  if (candidateResult) return candidateResult;

  const searched = loadBySearch('features.json', 'features');
  if (searched) return searched;

  return { data: [], path: undefined };
}
