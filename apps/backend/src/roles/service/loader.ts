import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Prefer source barrel first, then JS fallbacks
const candidates = [
  path.resolve(__dirname, './index.ts'),
  path.resolve(__dirname, './index.js'),
  path.resolve(__dirname, '../index.ts'),
  path.resolve(__dirname, '../index.js'),
];

export async function loadServiceModule(): Promise<any> {
  let lastErr: unknown = new Error('roles service module not found');
  for (const abs of candidates) {
    try {
      return await import(pathToFileURL(abs).href);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}
