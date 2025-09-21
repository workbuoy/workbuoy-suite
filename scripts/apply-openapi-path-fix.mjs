// scripts/apply-openapi-path-fix.mjs
import fs from 'node:fs';
import path from 'node:path';

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

const roots = ['openapi', 'docs', '.']; // scan common places
const files = [];
for (const r of roots) {
  if (fs.existsSync(r)) {
    for (const f of walk(r)) {
      if (/\.(ya?ml|json|md)$/i.test(f)) files.push(f);
    }
  }
}

let changes = 0;
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  const dst = src.replaceAll('/api/api/', '/api/');
  if (dst !== src) {
    fs.writeFileSync(f, dst);
    console.log(`[patched] ${f}`);
    changes++;
  }
}
console.log(`OpenAPI/docs path fix complete. Files changed: ${changes}`);
