#!/usr/bin/env node
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: run-storybook <command> [args...]');
  process.exit(1);
}

const workspaceNodeModules = path.resolve(__dirname, '..', 'node_modules');
const rootNodeModules = path.resolve(__dirname, '..', '..', '..', 'node_modules');

const existingNodePath = process.env.NODE_PATH
  ? process.env.NODE_PATH.split(path.delimiter).filter(Boolean)
  : [];

const nodePathEntries = new Set([
  workspaceNodeModules,
  rootNodeModules,
  ...existingNodePath,
]);

const env = {
  ...process.env,
  NODE_PATH: Array.from(nodePathEntries).join(path.delimiter),
};

const cliPath = path.resolve(rootNodeModules, 'storybook', 'bin', 'index.cjs');

const result = spawnSync(process.execPath, [cliPath, ...args], {
  stdio: 'inherit',
  env,
});

if (result.error) {
  console.error(result.error);
}

process.exit(result.status ?? 1);
