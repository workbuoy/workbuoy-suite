#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'meta', 'reports');
const ALLOWED_EXT = new Set(['.ts', '.tsx', '.js', '.mjs', '.cjs', '.json', '.md', '.yml', '.yaml']);
const IGNORE_DIRS = new Set(['.git', 'node_modules', 'dist', 'build', '.next', 'coverage']);

const args = new Set(process.argv.slice(2));
const shouldSuggest = args.has('--suggest');

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(abs, out);
    else if (ALLOWED_EXT.has(path.extname(entry.name))) out.push(abs);
  }
  return out;
}

function rel(p) {
  return path.relative(ROOT, p).replaceAll('\\', '/');
}

function scanTodos(files) {
  const todos = [];
  for (const f of files) {
    const text = fs.readFileSync(f, 'utf8');
    const lines = text.split(/\r?\n/);
    lines.forEach((line, idx) => {
      if (/\b(TODO|FIXME|HACK|XXX)\b/i.test(line)) {
        todos.push({ file: rel(f), line: idx + 1, text: line.trim() });
      }
    });
  }
  return todos;
}

function scanDuplicateConfig(files) {
  const byName = new Map();
  for (const f of files) {
    const base = path.basename(f);
    if (!/(package\.json|tsconfig(\..+)?\.json|\.env\.example|docker-compose\.ya?ml)$/i.test(base)) continue;
    if (!byName.has(base)) byName.set(base, []);
    byName.get(base).push(rel(f));
  }
  const dupes = [];
  for (const [name, matches] of byName.entries()) {
    if (matches.length > 1) dupes.push({ name, matches });
  }
  return dupes;
}

function priority(item) {
  if (item.type === 'fixme' || item.type === 'security') return 'P1';
  if (item.type === 'duplicate-config') return 'P2';
  return 'P3';
}

function buildBacklog(todos, duplicates) {
  const items = [];
  for (const t of todos.slice(0, 200)) {
    items.push({
      id: `todo-${t.file}-${t.line}`.replace(/[^a-zA-Z0-9-_]/g, '-'),
      type: /FIXME|HACK|XXX/i.test(t.text) ? 'fixme' : 'todo',
      title: `Resolve ${/FIXME|HACK|XXX/i.test(t.text) ? 'high-risk marker' : 'todo'} in ${t.file}:${t.line}`,
      evidence: t,
    });
  }
  for (const d of duplicates) {
    items.push({
      id: `dup-${d.name}`,
      type: 'duplicate-config',
      title: `Review duplicate config pattern: ${d.name}`,
      evidence: d,
    });
  }

  return items
    .map((it) => ({ ...it, priority: priority(it) }))
    .sort((a, b) => a.priority.localeCompare(b.priority));
}

function writeOutputs(backlog) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const jsonPath = path.join(OUT_DIR, 'meta-backlog.json');
  const mdPath = path.join(OUT_DIR, 'meta-backlog.md');

  fs.writeFileSync(jsonPath, JSON.stringify({ generatedAt: new Date().toISOString(), items: backlog }, null, 2));

  const lines = ['# META Backlog', '', `Generated: ${new Date().toISOString()}`, '', '| Priority | Type | Title |', '|---|---|---|'];
  for (const it of backlog.slice(0, 150)) {
    lines.push(`| ${it.priority} | ${it.type} | ${it.title.replaceAll('|', '\\|')} |`);
  }
  fs.writeFileSync(mdPath, `${lines.join('\n')}\n`);

  return { jsonPath: rel(jsonPath), mdPath: rel(mdPath) };
}

function suggestPatches(backlog) {
  const suggestions = backlog.slice(0, 20).map((item) => ({
    itemId: item.id,
    instruction: `Inspect ${item.title} and submit a minimal safe patch with tests.`,
    mode: 'manual-approval-required',
  }));

  const out = path.join(OUT_DIR, 'meta-patch-suggestions.json');
  fs.writeFileSync(out, JSON.stringify({ generatedAt: new Date().toISOString(), suggestions }, null, 2));
  return rel(out);
}

const files = walk(ROOT);
const todos = scanTodos(files);
const duplicates = scanDuplicateConfig(files);
const backlog = buildBacklog(todos, duplicates);
const outputs = writeOutputs(backlog);

console.log(`[meta] backlog written: ${outputs.mdPath}, ${outputs.jsonPath}`);
console.log(`[meta] findings: todos=${todos.length}, duplicate-config-groups=${duplicates.length}`);

if (shouldSuggest) {
  const patchFile = suggestPatches(backlog);
  console.log(`[meta] patch suggestions written: ${patchFile}`);
  console.log('[meta] No patches were applied automatically. Manual review is required.');
}
