// scripts/apply-router-path-fix.mjs
import fs from 'node:fs';

const targets = [
  'apps/backend/routes/features.ts',
  'apps/backend/routes/usage.ts'
];

for (const file of targets) {
  if (!fs.existsSync(file)) { console.warn(`[skip] ${file} missing`); continue; }
  const src = fs.readFileSync(file, 'utf8');
  let dst = src;
  if (file.endsWith('features.ts')) {
    dst = dst.replaceAll('/api/features/', '/features/');
    dst = dst.replaceAll("'/api/features", "'/features");
    dst = dst.replaceAll('"/api/features', '"/features');
  }
  if (file.endsWith('usage.ts')) {
    dst = dst.replaceAll('/api/usage/', '/usage/');
    dst = dst.replaceAll("'/api/usage", "'/usage");
    dst = dst.replaceAll('"/api/usage', '"/usage');
  }
  if (dst !== src) {
    fs.writeFileSync(file, dst);
    console.log(`[patched] ${file}`);
  } else {
    console.log(`[no-change] ${file} (already ok)`);
  }
}
console.log('Router path fix complete.');
