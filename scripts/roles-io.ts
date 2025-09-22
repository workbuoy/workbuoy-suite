// scripts/roles-io.ts
import fs from 'node:fs';
import path from 'node:path';

export function loadJSON(filePath: string) {
  const abs = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(abs)) throw new Error(`Missing file: ${abs}`);
  const raw = fs.readFileSync(abs, 'utf8');
  return JSON.parse(raw);
}

export function loadRolesFromRepo(): any[] {
  const rolesPathCandidates = [
    process.env.ROLES_PATH,
    'core/roles/roles.json',
    'roles/roles.json',
    'backend/roles/roles.json',
    'data/roles.json',
  ].filter((p): p is string => Boolean(p));
  for (const p of rolesPathCandidates) {
    try {
      const json = loadJSON(p);
      if (Array.isArray((json as any)?.roles)) return (json as any).roles as any[];
      if (Array.isArray(json)) return json as any[];
    } catch {}
  }
  throw new Error('Could not locate roles.json');
}

export function loadFeaturesFromRepo(): any[] {
  const featureCandidates = [
    process.env.FEATURES_PATH,
    'core/roles/features.json',
    'roles/features.json',
    'backend/roles/features.json',
    'data/features.json',
  ].filter((p): p is string => Boolean(p));
  for (const p of featureCandidates) {
    try {
      const json = loadJSON(p);
      if (Array.isArray((json as any)?.features)) return (json as any).features as any[];
      if (Array.isArray(json)) return json as any[];
    } catch {}
  }
  return [];
}
