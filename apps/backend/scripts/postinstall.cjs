#!/usr/bin/env node
/* postinstall.cjs – robust Prisma generate
   - Skips when WB_SKIP_PRISMA_GENERATE=1
   - Skips when schema missing
   - Prefers local prisma bin, falls back to npm exec / npx
*/
const { existsSync } = require('node:fs');
const { resolve } = require('node:path');
const { execFileSync } = require('node:child_process');

const workspaceRoot = resolve(__dirname, '..');
const schemaRel = 'prisma/schema.prisma';
const schemaPath = resolve(workspaceRoot, schemaRel);

if (process.env.WB_SKIP_PRISMA_GENERATE === '1') {
  console.log('[postinstall] WB_SKIP_PRISMA_GENERATE=1 → skip prisma generate');
  process.exit(0);
}

if (!existsSync(schemaPath)) {
  console.log(`[postinstall] No ${schemaRel} found → skip prisma generate`);
  process.exit(0);
}

const prismaBin = resolve(
  workspaceRoot,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'prisma.cmd' : 'prisma'
);

function run(cmd, args) {
  execFileSync(cmd, args, { stdio: 'inherit', cwd: workspaceRoot });
}

try {
  if (existsSync(prismaBin)) {
    run(prismaBin, ['generate', `--schema=${schemaPath}`]);
  } else {
    try {
      run('npm', ['exec', '-y', 'prisma', 'generate', `--schema=${schemaPath}`]);
    } catch {
      run('npx', ['-y', 'prisma', 'generate', `--schema=${schemaPath}`]);
    }
  }
  console.log('[postinstall] prisma generate completed');
} catch (err) {
  console.error('[postinstall] prisma generate failed:', err?.message || err);
  process.exit(1);
}
