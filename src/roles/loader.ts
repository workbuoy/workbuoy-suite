import fs from 'node:fs';
import path from 'node:path';
import { RoleProfile, FeatureDef } from './types';
import { defaultFeatures } from './seed/features';

interface LoadResult<T> {
  data: T[];
  path: string;
}

class JsonParseError extends Error {
  constructor(filePath: string, original: unknown) {
    const detail = original instanceof Error ? original.message : String(original);
    super(`parse error for ${filePath}: ${detail}`);
    this.name = 'JsonParseError';
  }
}

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const DEFAULT_FEATURE_SOURCE = 'src/roles/seed/features.ts (defaultFeatures export)';
const FALLBACK_ROLES_PATH = path.resolve(REPO_ROOT, 'scripts', 'fixtures', 'minimal-roles.json');
const FALLBACK_FEATURES_PATH = path.resolve(REPO_ROOT, 'scripts', 'fixtures', 'minimal-features.json');

function normalizeCandidates(envPath: string | undefined, fallbacks: string[]): string[] {
  const entries: string[] = [];
  if (envPath && envPath.trim()) {
    entries.push(envPath.trim());
  }
  entries.push(...fallbacks);

  const seen = new Set<string>();
  const deduped: string[] = [];
  for (const entry of entries) {
    const key = path.normalize(entry);
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(entry);
  }
  return deduped;
}

function expandCandidate(candidate: string): string[] {
  if (path.isAbsolute(candidate)) {
    return [candidate];
  }
  const absFromRoot = path.resolve(REPO_ROOT, candidate);
  const absFromCwd = path.resolve(process.cwd(), candidate);
  if (absFromRoot === absFromCwd) {
    return [absFromRoot];
  }
  return Array.from(new Set([absFromRoot, absFromCwd]));
}

function loadJson(absPath: string): unknown {
  const contents = fs.readFileSync(absPath, 'utf8');
  try {
    return JSON.parse(contents);
  } catch (err) {
    throw new JsonParseError(absPath, err);
  }
}

function tryLoadList<T = unknown>(
  candidateSpecs: string[],
  key: 'roles' | 'features',
): LoadResult<T> | null {
  for (const spec of candidateSpecs) {
    for (const abs of expandCandidate(spec)) {
      if (!fs.existsSync(abs)) continue;
      try {
        const json = loadJson(abs) as any;
        if (Array.isArray(json)) {
          return { data: json as T[], path: abs };
        }
        if (Array.isArray(json?.[key])) {
          return { data: json[key] as T[], path: abs };
        }
      } catch (err) {
        if (err instanceof JsonParseError) {
          console.error(`[roles.loader] ${err.message}`);
          throw err;
        }
        const reason = err instanceof Error ? err.message : String(err);
        console.warn(`[roles.loader] Failed to load ${abs}: ${reason}`);
      }
    }
  }
  return null;
}

function loadFallbackCatalog(): LoadResult<RoleProfile> & { features: FeatureDef[] } {
  const roles = loadJson(FALLBACK_ROLES_PATH) as RoleProfile[];
  const features = loadJson(FALLBACK_FEATURES_PATH) as FeatureDef[];
  console.warn(
    `[roles.loader] No role catalog found; falling back to minimal fixtures (${FALLBACK_ROLES_PATH})`,
  );
  return { data: roles, path: FALLBACK_ROLES_PATH, features };
}

function loadFallbackFeatures(): FeatureDef[] {
  console.warn(
    `[roles.loader] No feature catalog found; falling back to minimal fixtures (${FALLBACK_FEATURES_PATH})`,
  );
  return loadJson(FALLBACK_FEATURES_PATH) as FeatureDef[];
}

export interface RoleCatalog {
  roles: RoleProfile[];
  features: FeatureDef[];
  sources: {
    roles: string;
    features: string;
  };
}

export function loadRoleCatalog(): RoleCatalog {
  const roleCandidates = normalizeCandidates(process.env.ROLES_PATH, [
    path.join('core', 'roles', 'roles.json'),
    path.join('roles', 'roles.json'),
    path.join('backend', 'roles', 'roles.json'),
    path.join('data', 'roles.json'),
  ]);
  let rolesSource: LoadResult<RoleProfile> | null = null;
  let rolesParseError: JsonParseError | null = null;
  try {
    rolesSource = tryLoadList<RoleProfile>(roleCandidates, 'roles');
  } catch (err) {
    if (err instanceof JsonParseError) {
      rolesParseError = err;
    } else {
      throw err;
    }
  }

  if (!rolesSource) {
    if (process.env.NODE_ENV === 'test') {
      const fallback = loadFallbackCatalog();
      return {
        roles: fallback.data,
        features: fallback.features,
        sources: {
          roles: FALLBACK_ROLES_PATH,
          features: FALLBACK_FEATURES_PATH,
        },
      };
    }
    if (rolesParseError) {
      throw rolesParseError;
    }
    throw new Error(
      `[roles.loader] Could not locate roles catalog. Checked: ${roleCandidates.join(', ')}`,
    );
  }

  if (process.env.ROLES_PATH && rolesSource.path) {
    const envAbs = path.resolve(process.env.ROLES_PATH);
    if (path.resolve(rolesSource.path) === envAbs) {
      console.log(`[roles.loader] Using ROLES_PATH override: ${rolesSource.path}`);
    }
  }

  const featureCandidates = normalizeCandidates(process.env.FEATURES_PATH, [
    path.join('core', 'roles', 'features.json'),
    path.join('roles', 'features.json'),
    path.join('backend', 'roles', 'features.json'),
    path.join('data', 'features.json'),
  ]);
  let featuresSource: LoadResult<FeatureDef> | null = null;
  let featuresParseError: JsonParseError | null = null;
  try {
    featuresSource = tryLoadList<FeatureDef>(featureCandidates, 'features');
  } catch (err) {
    if (err instanceof JsonParseError) {
      featuresParseError = err;
    } else {
      throw err;
    }
  }

  let features: FeatureDef[];
  let featurePath: string;
  if (featuresSource) {
    features = featuresSource.data;
    featurePath = featuresSource.path;
    if (process.env.FEATURES_PATH) {
      const envAbs = path.resolve(process.env.FEATURES_PATH);
      if (path.resolve(featurePath) === envAbs) {
        console.log(`[roles.loader] Using FEATURES_PATH override: ${featurePath}`);
      }
    }
  } else {
    if (process.env.NODE_ENV === 'test') {
      features = loadFallbackFeatures();
      featurePath = FALLBACK_FEATURES_PATH;
    } else {
      if (featuresParseError) {
        throw featuresParseError;
      }
      features = defaultFeatures;
      featurePath = DEFAULT_FEATURE_SOURCE;
    }
  }

  return {
    roles: rolesSource.data,
    features,
    sources: {
      roles: rolesSource.path,
      features: featurePath,
    },
  };
}

export function loadRolesFromRepo(): RoleProfile[] {
  return loadRoleCatalog().roles;
}

export function loadFeaturesFromRepo(): FeatureDef[] {
  return loadRoleCatalog().features;
}

export { DEFAULT_FEATURE_SOURCE };
