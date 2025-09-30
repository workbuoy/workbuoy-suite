#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');

function run(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8' }).trim();
  } catch (error) {
    return '';
  }
}

const latestTag = run('git describe --tags --abbrev=0 2>/dev/null');
const range = latestTag ? `${latestTag}..HEAD` : '';
const rawLog = run(`git log ${range} --pretty=format:%H%x1f%s%x1e`);

const sections = new Map([
  ['feat', { title: 'Features', entries: [] }],
  ['fix', { title: 'Fixes', entries: [] }],
  ['docs', { title: 'Documentation', entries: [] }],
  ['chore', { title: 'Chores', entries: [] }],
  ['refactor', { title: 'Refactors', entries: [] }],
  ['perf', { title: 'Performance', entries: [] }],
  ['test', { title: 'Tests', entries: [] }],
  ['ci', { title: 'CI', entries: [] }],
  ['build', { title: 'Build', entries: [] }],
  ['style', { title: 'Style', entries: [] }],
  ['revert', { title: 'Reverts', entries: [] }],
]);
const extras = [];

if (rawLog) {
  rawLog.split('\x1e').forEach((entry) => {
    if (!entry.trim()) return;
    const [hash, subject] = entry.split('\x1f');
    if (!subject) return;
    const match = subject.match(/^(\w+)(?:\([^)]*\))?!?:\s*(.+)$/);
    if (match) {
      const [, type, message] = match;
      const key = type.toLowerCase();
      if (sections.has(key)) {
        sections.get(key).entries.push({ hash, message });
        return;
      }
    }
    extras.push({ hash, message: subject });
  });
}

const lines = [];
const headerVersion = process.env.npm_package_version || 'current';
if (latestTag) {
  lines.push(`# Release notes for ${headerVersion}`);
  lines.push(`Changes since ${latestTag}:`);
} else {
  lines.push(`# Release notes for ${headerVersion}`);
  lines.push('Initial release notes:');
}
lines.push('');

let hasContent = false;
for (const { title, entries } of sections.values()) {
  if (!entries.length) continue;
  hasContent = true;
  lines.push(`## ${title}`);
  entries.forEach(({ hash, message }) => {
    lines.push(`- ${message} (${hash.slice(0, 7)})`);
  });
  lines.push('');
}

if (extras.length) {
  hasContent = true;
  lines.push('## Other');
  extras.forEach(({ hash, message }) => {
    lines.push(`- ${message} (${hash.slice(0, 7)})`);
  });
  lines.push('');
}

if (!hasContent) {
  lines.push('_No changes since last tag._');
}

const output = lines.join('\n');
process.stdout.write(`${output}\n`);

if (process.env.GITHUB_STEP_SUMMARY) {
  try {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${output}\n`);
  } catch (error) {
    console.warn('Failed to write summary:', error.message);
  }
}
