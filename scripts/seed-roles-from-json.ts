import { seedRolesFromJson } from './seed-roles-lib';

(async () => {
  try {
    console.log('[seed] starting…');
    await seedRolesFromJson();
    console.log('[seed] finished successfully');
    process.exit(0);
  } catch (err) {
    console.error('[seed] failed:', err);
    process.exit(1);
  }
})();
