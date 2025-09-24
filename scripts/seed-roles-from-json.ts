import { seedRolesFromJson } from './seed-roles-lib';

async function main() {
  try {
    console.log('[seed] starting...');
    await seedRolesFromJson();
    console.log('[seed] finished successfully');
    process.exit(0);
  } catch (err) {
    console.error('[seed] failed:', err);
    process.exit(1);
  }
}

main();

// Safety net: kill after 60s if still running
setTimeout(() => {
  console.error('[seed] forced exit after timeout');
  process.exit(2);
}, 60_000);
