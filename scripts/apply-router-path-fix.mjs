// scripts/apply-router-path-fix.mjs
import fs from 'node:fs';

const targets = [
  'backend/routes/features.ts',
  'backend/routes/usage.ts'
];

let changed = 0;

for (const file of targets) {
  if (!fs.existsSync(file)) {
    console.warn(`[skip] ${file} not found`);
    continue;
  }
  const src = fs.readFileSync(file, 'utf8');
  let dst = src;

  if (file.includes('features.ts')) {
    // Replace only router-declared absolute paths
    dst = dst.replaceAll("/api/features/", "/features/");
  }
  if (file.includes('usage.ts')) {
    dst = dst.replaceAll("/api/usage/", "/usage/");
  }

  if (dst !== src) {
    fs.writeFileSync(file, dst);
    console.log(`[patched] ${file}`);
    changed++;
  } else {
    console.log(`[no-change] ${file}`);
  }
}

if (changed === 0) {
  console.log("No changes applied. If your code already uses '/features/*' and '/usage/*' inside the routers, you're good.");
} else {
  console.log(`Done. Modified ${changed} file(s).`);
}
