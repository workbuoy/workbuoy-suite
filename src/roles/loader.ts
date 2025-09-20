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
      const contents = fs.readFileSync(full, 'utf8').trim();
      try {
        const parsed = JSON.parse(contents);
        return parsed as RoleProfile[];
      } catch (err) {
        const loose = parseLooseRoles(contents);
        if (loose && loose.length) {
          console.warn(`[roles.loader] parsed ${loose.length} roles from loosely formatted ${p}`);
          return loose;
        }
        console.warn(`[roles.loader] failed to parse roles from ${p}: ${err instanceof Error ? err.message : err}`);
      }
    }
  }
  console.warn('[roles.loader] roles.json not found; using empty list');
  return [];
}

function parseLooseRoles(payload: string): RoleProfile[] | null {
  const results: RoleProfile[] = [];
  let buffer = '';
  let depth = 0;
  let inString = false;
  let escape = false;
  let failures = 0;

  const pushChunk = (chunk: string) => {
    let trimmed = chunk.trim();
    if (!trimmed) return false;
    if (trimmed.endsWith(',')) {
      trimmed = trimmed.slice(0, -1).trimEnd();
    }
    if (trimmed.startsWith(',')) {
      trimmed = trimmed.slice(1).trimStart();
    }
    if (!trimmed) return false;
    try {
      const value = JSON.parse(trimmed);
      if (Array.isArray(value)) {
        for (const entry of value) {
          if (entry) results.push(entry as RoleProfile);
        }
      } else {
        results.push(value as RoleProfile);
      }
      return true;
    } catch (err) {
      failures += 1;
      return false;
    }
  };

  for (const char of payload) {
    if (!inString && depth === 0 && !char.trim()) {
      continue;
    }

    buffer += char;

    if (inString) {
      if (escape) {
        escape = false;
      } else if (char === '\\') {
        escape = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
    } else if (char === '{' || char === '[') {
      depth += 1;
    } else if (char === '}' || char === ']') {
      depth -= 1;
      if (depth === 0) {
        pushChunk(buffer);
        buffer = '';
      }
    }
  }

  if (buffer.trim()) {
    pushChunk(buffer);
  }

  if (results.length && failures) {
    console.warn(`[roles.loader] parsed ${results.length} roles with ${failures} chunk errors`);
  }

  return results.length ? results : null;
}

export function loadFeaturesFromRepo(): FeatureDef[] {
  return defaultFeatures;
}
