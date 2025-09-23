#!/usr/bin/env node
// scripts/seed-roles-from-json.cjs
// CommonJS wrapper delegating to the canonical tsx runner.
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const script = path.resolve(__dirname, 'seed-roles-from-json.ts');
const result = spawnSync(process.execPath, ['--loader', 'tsx', script], {
  stdio: 'inherit',
});

if (result.error) {
  console.error('[seed-roles-from-json.cjs] failed:', result.error);
  process.exit(1);
}
process.exit(result.status ?? 0);
