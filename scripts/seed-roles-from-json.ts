import { seedRolesFromJson } from './seed-roles-lib';

async function main() {
  console.log('[seed] starting…');
  const result = await seedRolesFromJson();

  if (result?.skipped) {
    console.log(`[seed] skipped: ${result.skipped}`);
    return { roles: 0, features: 0 };
  }

  const summary = result?.summary ?? { roles: 0, features: 0 };
  console.log(`seeded roles=${summary.roles}, features=${summary.features}`);
  return summary;
}

main()
  .then(() => {
    console.log('[seed] completed successfully');
  })
  .catch((err) => {
    console.error('[seed] failed:', err);
    process.exitCode = 1;
  });
