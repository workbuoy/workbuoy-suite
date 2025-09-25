import { seedRolesFromJson } from './seed-roles-lib';

const TIMEOUT_MS = 60_000;

const timeout = setTimeout(() => {
  console.error('[seed] forced exit after timeout');
  process.exit(2);
}, TIMEOUT_MS);

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
    clearTimeout(timeout);
    process.exit(0);
  })
  .catch((err) => {
    clearTimeout(timeout);
    console.error('[seed] failed:', err);
    process.exitCode = 1;
    throw err;
  });
