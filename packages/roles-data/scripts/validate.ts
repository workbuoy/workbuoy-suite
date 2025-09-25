import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

type RoleRecord = {
  role_id?: unknown;
  title?: unknown;
  canonical_title?: unknown;
};

type FeatureRecord = {
  id?: unknown;
  title?: unknown;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pkgDir = path.resolve(__dirname, '..');

function readJson(fileName: string): unknown {
  const target = path.join(pkgDir, fileName);
  const raw = fs.readFileSync(target, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to parse ${fileName}: ${message}`);
  }
}

function ensureArray(value: unknown, label: string): any[] {
  if (Array.isArray(value)) {
    return value;
  }
  throw new Error(`${label} must be an array`);
}

function validateRoles(): { count: number; duplicates: string[] } {
  const json = readJson('roles.json');
  const roles = ensureArray(json, 'roles');
  const seen = new Set<string>();
  const duplicates: string[] = [];
  const errors: string[] = [];

  roles.forEach((entry, index) => {
    const record = entry as RoleRecord;
    const roleId = typeof record.role_id === 'string' ? record.role_id.trim() : '';
    if (!roleId) {
      errors.push(`roles[${index}] missing role_id`);
    } else if (seen.has(roleId)) {
      duplicates.push(roleId);
    } else {
      seen.add(roleId);
    }
    const titleSource =
      typeof record.title === 'string' ? record.title : typeof record.canonical_title === 'string' ? record.canonical_title : '';
    const title = titleSource.trim();
    if (!title) {
      errors.push(`roles[${index}] missing title`);
    }
  });

  if (errors.length) {
    throw new Error(errors.slice(0, 10).join('; '));
  }

  return { count: roles.length, duplicates };
}

function validateFeatures(): { count: number; duplicates: string[] } {
  const json = readJson('features.json');
  const features = ensureArray(json, 'features');
  const seen = new Set<string>();
  const duplicates: string[] = [];
  const errors: string[] = [];

  features.forEach((entry, index) => {
    const record = entry as FeatureRecord;
    const featureId = typeof record.id === 'string' ? record.id.trim() : '';
    if (!featureId) {
      errors.push(`features[${index}] missing id`);
    } else if (seen.has(featureId)) {
      duplicates.push(featureId);
    } else {
      seen.add(featureId);
    }
    const title = typeof record.title === 'string' ? record.title.trim() : '';
    if (!title) {
      errors.push(`features[${index}] missing title`);
    }
  });

  if (errors.length) {
    throw new Error(errors.slice(0, 10).join('; '));
  }

  return { count: features.length, duplicates };
}

function main(): void {
  try {
    const roles = validateRoles();
    const features = validateFeatures();
    const summary = {
      ok: roles.duplicates.length === 0 && features.duplicates.length === 0,
      roles,
      features,
    };
    console.log(JSON.stringify(summary, null, 2));
    if (roles.duplicates.length || features.duplicates.length) {
      const issues: string[] = [];
      if (roles.duplicates.length) {
        issues.push(`roles: ${roles.duplicates.slice(0, 5).join(', ')}${
          roles.duplicates.length > 5 ? ` (+${roles.duplicates.length - 5} more)` : ''
        }`);
      }
      if (features.duplicates.length) {
        issues.push(`features: ${features.duplicates.slice(0, 5).join(', ')}${
          features.duplicates.length > 5 ? ` (+${features.duplicates.length - 5} more)` : ''
        }`);
      }
      if (issues.length) {
        console.warn(`[roles-data] duplicate identifiers detected -> ${issues.join(' | ')}`);
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(message);
    process.exit(1);
  }
}

main();
