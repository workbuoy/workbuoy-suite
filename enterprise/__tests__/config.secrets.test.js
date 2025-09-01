/**
 * Verifies that getSecret() exists and is async.
 */
import { getSecret } from '../lib/config/secrets.js';

test('getSecret returns a promise', async () => {
  const p = getSecret('NON_EXISTENT_KEY');
  expect(typeof p.then).toBe('function');
  const v = await p;
  expect(v === undefined || v === null || typeof v === 'string' || typeof v === 'object').toBe(true);
});
