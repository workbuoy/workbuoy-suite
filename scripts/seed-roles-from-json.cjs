#!/usr/bin/env node
// scripts/seed-roles-from-json.cjs
// Wrapper delegating to the unified prisma/seed.ts entrypoint.
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const script = path.resolve(__dirname, '../apps/backend/prisma/seed.ts');
const args = process.argv.slice(2);

const result = spawnSync(process.execPath, ['--import', 'tsx', script, ...args], {
  stdio: 'inherit',
});

if (result.error) {
  console.error('[seed-roles-from-json.cjs] failed:', result.error);
  process.exit(1);
}

process.exit(result.status ?? 0);
