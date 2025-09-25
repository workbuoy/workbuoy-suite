#!/usr/bin/env node
/**
 * Reports package.json files that are NOT covered by the root workspaces.
 *
 * Non-blocking: exit code 0; prints a list to act upon.
 */
const fs = require('node:fs');
const path = require('node:path');

const rootDir = process.cwd();
const rootPackagePath = path.join(rootDir, 'package.json');

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function normalizePatterns(workspaces) {
  if (!workspaces) {
    return [];
  }
  const patternsArray = Array.isArray(workspaces)
    ? workspaces
    : Array.isArray(workspaces.packages)
    ? workspaces.packages
    : [];

  return patternsArray
    .filter((pattern) => typeof pattern === 'string' && pattern.trim().length > 0)
    .map((pattern) => pattern.trim());
}

function patternToRegex(pattern) {
  const normalized = pattern.replace(/\\/g, '/').replace(/\/$/, '');
  const escaped = normalized.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  const withWildcards = escaped
    .replace(/\\\*\\\*/g, '.*')
    .replace(/\\\*/g, '[^/]+');
  return new RegExp(`^${withWildcards}(?:/|$)`);
}

function computeWorkspaceMatchers(patterns) {
  return patterns.map((pattern) => patternToRegex(pattern));
}

function isInWorkspace(relativePath, matchers) {
  return matchers.some((matcher) => matcher.test(relativePath));
}

function collectPackageJsonFiles(startDir) {
  const stack = [startDir];
  const packages = [];
  const ignoredNames = new Set([
    'node_modules',
    '.git',
    '.hg',
    '.svn',
    '.turbo',
    '.idea',
    '.vscode',
    '.cache',
    '.next',
    '.yarn',
    'dist',
    'build',
    'coverage',
    'tmp',
    'temp',
  ]);

  while (stack.length > 0) {
    const currentDir = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch (error) {
      continue;
    }

    for (const entry of entries) {
      const entryName = entry.name;
      const entryPath = path.join(currentDir, entryName);
      if (entry.isSymbolicLink()) {
        continue;
      }
      if (entry.isDirectory()) {
        if (ignoredNames.has(entryName) || entryName.startsWith('.')) {
          continue;
        }
        stack.push(entryPath);
        continue;
      }
      if (entry.isFile() && entryName === 'package.json') {
        packages.push(entryPath);
      }
    }
  }

  return packages;
}

function main() {
  if (!fs.existsSync(rootPackagePath)) {
    console.error('[guard] Unable to locate root package.json');
    process.exit(0);
    return;
  }

  const rootPackageJson = readJSON(rootPackagePath);
  const workspacePatterns = normalizePatterns(rootPackageJson.workspaces);
  const workspaceMatchers = computeWorkspaceMatchers(workspacePatterns);

  const allPackages = collectPackageJsonFiles(rootDir)
    .map((absolutePath) => path.resolve(absolutePath))
    .filter((absolutePath) => absolutePath !== path.resolve(rootPackagePath));

  const orphans = allPackages
    .filter((absolutePath) => {
      const relativeDirectory = path
        .relative(rootDir, path.dirname(absolutePath))
        .split(path.sep)
        .join('/');
      return !isInWorkspace(relativeDirectory, workspaceMatchers);
    })
    .sort((a, b) => a.localeCompare(b));

  if (orphans.length > 0) {
    console.log('[guard] Orphan workspaces (not covered by root workspaces):');
    for (const orphan of orphans) {
      console.log(` - ${path.relative(rootDir, orphan)}`);
    }
    console.log(`[guard] Total: ${orphans.length}. Consider adding them to workspaces or archiving.`);
  } else {
    console.log('[guard] No orphan workspaces detected');
  }

  process.exit(0);
}

main();
