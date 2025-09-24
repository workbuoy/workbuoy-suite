import { execSync } from 'node:child_process';
import { statSync } from 'node:fs';

let tracked = [];
try {
  const output = execSync("git ls-files 'meta/*.jsonl' 'reports/**/*.json'", {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
  tracked = output.split(/\r?\n/).filter(Boolean);
} catch (error) {
  const stdout = error?.stdout ? error.stdout.toString() : '';
  if (stdout) {
    tracked = stdout.split(/\r?\n/).filter(Boolean);
  } else if (error.status) {
    throw error;
  }
}

if (tracked.length === 0) {
  console.log('OK');
  process.exit(0);
}

const emptyFiles = [];
for (const file of tracked) {
  const { size } = statSync(file);
  if (size === 0) {
    emptyFiles.push(file);
  }
}

if (emptyFiles.length > 0) {
  for (const file of emptyFiles) {
    console.error(`Empty generated file tracked: ${file}`);
  }
  process.exit(1);
}

console.log('OK');
