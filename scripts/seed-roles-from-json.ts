import { seedRolesFromJson } from './seed-roles-lib.js';

async function main() {
  console.log('[seed] starting…');
  const result = await seedRolesFromJson();

  if (result?.skipped) {
    console.log(`[seed] skipped: ${result.skipped}`);
  } else {
    const summary = result?.summary ?? { roles: 0, features: 0 };
    console.log(`[seed] completed roles=${summary.roles}, features=${summary.features}`);
  }

  console.log('[seed] completed successfully');
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('[seed] failed:', err);
    process.exit(1);
  });
