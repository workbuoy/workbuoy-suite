import { seedRolesFromJson } from './seed-roles-lib';

async function main() {
  console.log('[seed] starting…');
  const result = await seedRolesFromJson();

  if (result?.skipped) {
    console.log(`[seed] skipped: ${result.skipped}`);
    process.exit(0);
  }

  const summary = result?.summary ?? { roles: 0, features: 0 };
  console.log(`seeded roles=${summary.roles}, features=${summary.features}`);
  console.log('[seed] completed successfully');
  process.exit(0);
}

main().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
