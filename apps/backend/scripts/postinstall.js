// ESM or CJS are acceptable; using CJS for compatibility under Node 20
const { existsSync } = require('fs');
const { execSync } = require('child_process');
const path = require('path');

if (process.env.WB_SKIP_PRISMA_GENERATE === '1') {
  console.log('[postinstall] WB_SKIP_PRISMA_GENERATE=1 → skip');
  process.exit(0);
}

const schema = path.resolve(process.cwd(), 'prisma/schema.prisma');
if (!existsSync(schema)) {
  console.log(`[postinstall] ${schema} not found → skip`);
  process.exit(0);
}

function run(cmd) {
  console.log(`[postinstall] ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

try {
  run('npm exec -y prisma generate -- --schema=prisma/schema.prisma');
} catch (error) {
  console.warn('[postinstall] npm exec failed, falling back to npx');
  run('npx -y prisma generate --schema=prisma/schema.prisma');
}
