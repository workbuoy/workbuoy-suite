// scripts/apply-features-active-guard.mjs
import fs from 'node:fs';

const file = 'apps/backend/routes/features.ts';
if (!fs.existsSync(file)) {
  console.error(`[error] ${file} not found. Run this from repo root.`);
  process.exit(1);
}

const src = fs.readFileSync(file, 'utf8');

// Look for the router declaration.
const routerDeclRegex = /(const\s+\w+\s*=\s*Router\s*\(\s*\)\s*;?)/;
const m = src.match(routerDeclRegex);
if (!m) {
  console.error('[error] Could not find Router() declaration in apps/backend/routes/features.ts');
  process.exit(2);
}

const insertAfter = m.index + m[0].length;
const guard = `

/** In-memory fallback guard: return 204 on /features/active when FF_PERSISTENCE=false.
 *  This runs BEFORE the existing route handler(s), so it won't affect DB-backed mode.
 */
r.get('/features/active', (req, res, next) => {
  try {
    if (process.env.FF_PERSISTENCE === 'false') {
      return res.status(204).end();
      // To return an empty array instead, use:
      // return res.status(200).json([]);
    }
  } catch {}
  return next();
});
`;

const dst = src.slice(0, insertAfter) + guard + src.slice(insertAfter);
fs.writeFileSync(file, dst, 'utf8');
console.log('[patched] Inserted in-memory 204 guard into apps/backend/routes/features.ts');
