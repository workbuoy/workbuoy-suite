#!/usr/bin/env node
// scripts/seed-roles-from-json.cjs
// CommonJS wrapper so CI can run without ESM loader.
(async () => {
  try {
    try { require('ts-node/register'); } catch {}
    const lib = require('./seed-roles-lib.ts'); // ts-node/register will hook this
    const res = await lib.runSeed();
    console.log(JSON.stringify({ ok: true, ...res }));
  } catch (err) {
    console.error('[seed-roles-from-json.cjs] failed:', err);
    process.exit(1);
  }
})();
