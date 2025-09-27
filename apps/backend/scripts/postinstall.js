import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

if (process.env.WB_SKIP_PRISMA_GENERATE === '1') {
  console.log('[postinstall] WB_SKIP_PRISMA_GENERATE=1 → skipping prisma generate');
  process.exit(0);
}

const schemaPath = 'prisma/schema.prisma';
if (!existsSync(schemaPath)) {
  console.log(`[postinstall] ${schemaPath} not found → skipping prisma generate`);
  process.exit(0);
}

console.log('[postinstall] running: npx prisma generate --schema=prisma/schema.prisma');
execSync('npx prisma generate --schema=prisma/schema.prisma', { stdio: 'inherit' });
