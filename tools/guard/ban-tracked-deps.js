#!/usr/bin/env node
/**
 * Fails if ANY file under node_modules is tracked by Git.
 *
 * This protects the repo from accidental dependency check-ins.
 */
const { execSync } = require('node:child_process');

let raw;
try {
  raw = execSync('git ls-files -z', { encoding: 'buffer' }).toString('utf8');
} catch (error) {
  console.error('[guard] Failed to run git ls-files:', error && error.message ? error.message : error);
  const exitCode = typeof error?.status === 'number' ? error.status : 2;
  process.exit(exitCode);
}

const files = raw.split('\0').filter(Boolean);
const offenders = files.filter((file) => /(^|\/)node_modules\//.test(file));

if (offenders.length > 0) {
  console.error('[guard] Tracked node_modules detected:');
  const maxList = 50;
  offenders.slice(0, maxList).forEach((file) => {
    console.error(` - ${file}`);
  });
  if (offenders.length > maxList) {
    console.error(`[guard] ...and ${offenders.length - maxList} more`);
  }
  console.error(`[guard] Found ${offenders.length} offending file(s). Remove them from Git and try again.`);
  process.exit(1);
}

console.log('[guard] OK: no tracked node_modules found');
