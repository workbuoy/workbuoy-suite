import fs from 'node:fs';
import path from 'node:path';
import { RoleProfile, FeatureDef } from './types';
import { defaultFeatures } from './seed/features';

export function loadRolesFromRepo(): RoleProfile[] {
  const candidates = [
    'roles/roles.json',
    'data/roles.json',
    'src/roles/roles.json',
    'roles.json'
  ];
  for (const p of candidates) {
    const full = path.resolve(process.cwd(), p);
    if (fs.existsSync(full)) {
      const raw = JSON.parse(fs.readFileSync(full, 'utf8'));
      return raw as RoleProfile[];
    }
  }
  console.warn('[roles.loader] roles.json not found; using empty list');
  return [];
}

export function loadFeaturesFromRepo(): FeatureDef[] {
  return defaultFeatures;
}
