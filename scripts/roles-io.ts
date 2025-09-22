import fs from 'node:fs';
import path from 'node:path';

function tryReadJSON(abs: string) {
  const raw = fs.readFileSync(abs, 'utf8');
  return JSON.parse(raw);
}

export function resolveFirst(paths: string[]): string | null {
  for (const p of paths) {
    if (!p) continue;
    const abs = path.resolve(process.cwd(), p);
    if (fs.existsSync(abs)) return abs;
  }
  return null;
}

export function resolveRolesPath(): string {
  const candidates = [
    process.env.ROLES_PATH || '',
    'core/roles/roles.json',
    'roles/roles.json',
    'backend/roles/roles.json',
    'data/roles.json',
  ];
  const found = resolveFirst(candidates);
  if (!found) {
    throw new Error(`Could not locate roles.json (tried: ${candidates.filter(Boolean).join(', ')})`);
  }
  return found;
}

export function resolveFeaturesPath(): string | null {
  const candidates = [
    process.env.FEATURES_PATH || '',
    'core/roles/features.json',
    'roles/features.json',
    'backend/roles/features.json',
    'data/features.json',
  ];
  return resolveFirst(candidates);
}

export function loadRolesFromRepo(): any[] {
  const file = resolveRolesPath();
  const json = tryReadJSON(file);
  if (Array.isArray((json as any)?.roles)) return (json as any).roles as any[];
  if (Array.isArray(json)) return json as any[];
  throw new Error(`roles.json at ${file} had unexpected shape`);
}

export function loadFeaturesFromRepo(): any[] {
  const file = resolveFeaturesPath();
  if (!file) return [];
  const json = tryReadJSON(file);
  if (Array.isArray((json as any)?.features)) return (json as any).features as any[];
  if (Array.isArray(json)) return json as any[];
  return [];
}
