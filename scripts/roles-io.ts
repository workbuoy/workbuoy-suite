import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export class JsonParseError extends Error {
  public readonly filePath: string;
  public readonly cause: unknown;

  constructor(filePath: string, cause: unknown) {
    super(`Failed to parse JSON from ${filePath}: ${cause instanceof Error ? cause.message : String(cause)}`);
    this.name = 'JsonParseError';
    this.filePath = filePath;
    this.cause = cause;
  }
}

export type JsonSource<T> = { path: string; data: T };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const isTestEnv = () => process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;

function asAbsolute(candidate: string) {
  return path.isAbsolute(candidate) ? candidate : path.resolve(repoRoot, candidate);
}

function loadJson<T = unknown>(candidate: string): JsonSource<T> | null {
  const absolute = asAbsolute(candidate);
  if (!fs.existsSync(absolute)) return null;
  try {
    const raw = fs.readFileSync(absolute, 'utf8');
    return { path: absolute, data: JSON.parse(raw) };
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new JsonParseError(absolute, error);
    }
    throw error;
  }
}

function resolveFromCandidates<T = unknown>(
  envVar: string,
  defaults: string[],
  fallbackFixture: string
): JsonSource<T> | null {
  const overridePath = process.env[envVar];
  if (overridePath) {
    const source = loadJson<T>(overridePath);
    if (source) return source;
    throw new Error(`Configured ${envVar}=${overridePath} does not exist`);
  }

  for (const candidate of defaults) {
    const source = loadJson<T>(candidate);
    if (source) return source;
  }

  if (isTestEnv()) {
    const source = loadJson<T>(path.join('scripts', 'fixtures', fallbackFixture));
    if (source) return source;
  }

  return null;
}

export function resolveRolesSource<T = unknown>(): JsonSource<T> | null {
  const defaults = [
    path.join('core', 'roles', 'roles.json'),
    path.join('roles', 'roles.json'),
    path.join('backend', 'roles', 'roles.json')
  ];
  return resolveFromCandidates<T>('ROLES_PATH', defaults, 'minimal-roles.json');
}

export function resolveFeaturesSource<T = unknown>(): JsonSource<T> | null {
  const defaults = [
    path.join('core', 'roles', 'features.json'),
    path.join('roles', 'features.json'),
    path.join('backend', 'roles', 'features.json')
  ];
  return resolveFromCandidates<T>('FEATURES_PATH', defaults, 'minimal-features.json');
}

