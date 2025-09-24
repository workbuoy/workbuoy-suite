import { execSync } from 'node:child_process';

const trackedFiles = execSync('git ls-files', { encoding: 'utf8' })
  .split(/\r?\n/)
  .filter(Boolean);

const trackedDirs = new Set();

for (const file of trackedFiles) {
  const normalized = file.replace(/\\/g, '/');
  const marker = 'node_modules/';
  const index = normalized.indexOf(marker);
  if (index !== -1) {
    const dir = normalized.slice(0, index + marker.length - 1);
    trackedDirs.add(dir);
  }
}

if (trackedDirs.size > 0) {
  console.error('Tracked node_modules detected:');
  for (const dir of Array.from(trackedDirs).sort()) {
    console.error(` - ${dir}`);
  }
  process.exit(1);
}

console.log('OK');
