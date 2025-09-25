#!/usr/bin/env node

/**
 * Guard that fails when tracked files exceed a configurable size threshold.
 */

const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_MAX_BYTES = 5 * 1024 * 1024;
const MAX_BYTES = Number.parseInt(
  process.env.GUARD_MAX_FILE_BYTES ?? String(DEFAULT_MAX_BYTES),
  10,
);

if (!Number.isFinite(MAX_BYTES) || MAX_BYTES <= 0) {
  console.error('[guard] Invalid GUARD_MAX_FILE_BYTES value:', process.env.GUARD_MAX_FILE_BYTES);
  process.exit(1);
}

const allowlistPath = path.resolve('tools/guard/large-files.allowlist');
const allowlist = fs.existsSync(allowlistPath)
  ? fs
      .readFileSync(allowlistPath, 'utf8')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
  : [];

const allowlistMatchers = allowlist.map((pattern) => {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp('^' + escaped.replace(/\*/g, '.*') + '$');
  return (filePath) => regex.test(filePath);
});

function isAllowed(filePath) {
  return allowlistMatchers.some((match) => match(filePath));
}

function getTrackedFiles() {
  try {
    const output = execSync('git ls-files -z', { encoding: 'utf8' });
    return output.split('\0').filter(Boolean);
  } catch (error) {
    console.error('[guard] Failed to enumerate tracked files via git ls-files.');
    console.error(String(error));
    process.exit(1);
  }
}

function getFileSize(filePath) {
  try {
    return fs.statSync(filePath).size;
  } catch (error) {
    console.error(`[guard] Unable to stat ${filePath}`);
    console.error(String(error));
    process.exit(1);
  }
}

const offenders = getTrackedFiles()
  .map((filePath) => [filePath, getFileSize(filePath)])
  .filter(([filePath, size]) => size > MAX_BYTES && !isAllowed(filePath));

if (offenders.length > 0) {
  console.error(`[guard] Large files detected (> ${MAX_BYTES} bytes):`);
  for (const [filePath, size] of offenders) {
    console.error(` - ${filePath} (${size} bytes)`);
  }
  console.error('[guard] Add intentional exceptions to tools/guard/large-files.allowlist with justification if unavoidable.');
  process.exit(1);
}

console.log('[guard] OK: no large tracked files');
