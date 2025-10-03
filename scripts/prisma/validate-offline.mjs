import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const schemaPath = resolve(process.cwd(), 'prisma/schema.prisma');
if (!existsSync(schemaPath)) {
  console.error('[prisma:validate] schema.prisma not found at', schemaPath);
  process.exit(1);
}

const contents = readFileSync(schemaPath, 'utf8');
if (!contents.trim()) {
  console.error('[prisma:validate] schema.prisma is empty');
  process.exit(1);
}

if (!/datasource\s+\w+/m.test(contents)) {
  console.error('[prisma:validate] Missing datasource block');
  process.exit(1);
}

if (!/generator\s+\w+/m.test(contents)) {
  console.error('[prisma:validate] Missing generator block');
  process.exit(1);
}

let validatedViaWasm = false;
try {
  const wasm = await import('@prisma/prisma-schema-wasm');
  if (typeof wasm.lint === 'function') {
    const result = wasm.lint(contents, 'db', { prismaFmtVersion: 'wasm' });
    const diagnostics = JSON.parse(result || '[]');
    if (Array.isArray(diagnostics) && diagnostics.length > 0) {
      console.error('[prisma:validate] schema diagnostics:', diagnostics);
      process.exit(1);
    }
    validatedViaWasm = true;
  }
} catch (error) {
  console.warn('[prisma:validate] WASM lint unavailable, falling back to lightweight checks:', error?.message || error);
}

if (validatedViaWasm) {
  console.log('[prisma:validate] schema validated via WASM engine');
} else {
  console.log('[prisma:validate] basic schema structure checks passed');
}
