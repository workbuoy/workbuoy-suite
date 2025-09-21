// scripts/seed-roles-lib.ts
import fs from 'node:fs';
import path from 'node:path';

async function dynamic(p) {
  return (await import(p));
}

export function loadJSON(filePath) {
  const abs = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(abs)) throw new Error(\`Missing file: \${abs}\`);
  const raw = fs.readFileSync(abs, 'utf8');
  return JSON.parse(raw);
}

export function loadRolesFromRepo() {
  const rolesPathCandidates = [
    'roles/roles.json',
    'backend/roles/roles.json',
    'data/roles.json'
  ];
  for (const p of rolesPathCandidates) {
    try {
      const json = loadJSON(p);
      if (Array.isArray(json?.roles)) return json.roles;
      if (Array.isArray(json)) return json;
    } catch {}
  }
  throw new Error('Could not locate roles.json');
}

export function loadFeaturesFromRepo() {
  const featureCandidates = [
    'roles/features.json',
    'backend/roles/features.json',
    'data/features.json'
  ];
  for (const p of featureCandidates) {
    try {
      const json = loadJSON(p);
      if (Array.isArray(json?.features)) return json.features;
      if (Array.isArray(json)) return json;
    } catch {}
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
