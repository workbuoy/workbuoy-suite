// scripts/seed-roles-from-json.ts
import { seedRolesFromJson } from './seed-roles-lib.ts';
import { importRolesAndFeatures } from '../src/roles/service';

async function main() {
  try {
    const result = await seedRolesFromJson(importRolesAndFeatures);
    if (result.summary) {
      console.log(
        JSON.stringify({
          ok: true,
          summary: result.summary,
          rolesPath: result.rolesPath,
          featuresPath: result.featuresPath,
        })
      );
    } else {
      console.log(JSON.stringify(result));
    }
  } catch (err: any) {
    console.error('[seed-roles-from-json] failed:', err?.stack || err?.message || String(err));
    process.exit(1);
  }
}

main();
