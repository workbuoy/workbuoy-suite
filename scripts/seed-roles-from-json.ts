import { runSeed } from './seed-roles-lib';

runSeed().then(
  (result) => {
    if (!result.skipped) {
      const roles = result.summary?.roles ?? 0;
      const features = result.summary?.features ?? 0;
      console.log(`seeded roles=${roles} features=${features}`);
    }
  },
  (error) => {
    console.error('[seed-roles-from-json] failed:', error);
    process.exit(1);
  }
);
