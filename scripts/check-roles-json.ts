import fs from 'node:fs';
import { createRequire } from 'node:module';

function main(): void {
  const requireFromHere = createRequire(import.meta.url);
  const target = requireFromHere.resolve('@workbuoy/roles-data/roles.json');

  try {
    const raw = fs.readFileSync(target, 'utf8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error('roles payload must be a top-level array');
    }

    const seen = new Set<string>();
    const duplicates: string[] = [];
    for (const entry of parsed) {
      const roleId = entry?.role_id;
      if (typeof roleId !== 'string' || !roleId.trim()) {
        continue;
      }
      if (seen.has(roleId)) {
        duplicates.push(roleId);
      } else {
        seen.add(roleId);
      }
    }

    console.log(
      JSON.stringify({
        ok: true,
        path: target,
        roles: parsed.length,
        duplicateRoleIds: duplicates,
      })
    );
    if (duplicates.length) {
      console.warn(`[check-roles-json] duplicate role_ids detected: ${duplicates.join(', ')}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const positionMatch = message.match(/position (\d+)/i);
    const payload = {
      ok: false,
      path: target,
      error: message,
      position: positionMatch ? Number(positionMatch[1]) : undefined,
    };
    console.error(JSON.stringify(payload));
    process.exit(1);
  }
}

main();
