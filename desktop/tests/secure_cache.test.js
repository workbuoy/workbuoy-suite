import fs from 'fs';
import path from 'path';
import { SecureCache } from '../cache/secure_cache.js';

const TMP = path.join(process.cwd(), 'tmp_test_cache');
beforeAll(() => { try { fs.rmSync(TMP, { recursive: true, force: true }); } catch {} fs.mkdirSync(TMP); process.chdir(TMP); });
afterAll(() => { try { fs.rmSync(TMP, { recursive: true, force: true }); } catch {} });

test('encrypt/decrypt roundtrip and no plaintext remains', () => {
  const sc = new SecureCache(path.join(TMP, '.wb_cache.enc'));
  // seed legacy plaintext
  fs.writeFileSync(path.join(TMP, '.wb_cache.json'), JSON.stringify([{op:'x'}]));
  const q1 = sc.loadQueue(); // triggers migration
  expect(Array.isArray(q1)).toBe(true);
  // legacy should be gone
  expect(fs.existsSync(path.join(TMP, '.wb_cache.json'))).toBe(false);

  // file should be base64 and not contain 'op'
  const raw = fs.readFileSync(path.join(TMP, '.wb_cache.enc'), 'utf8');
  expect(raw.includes('op')).toBe(false);

  // append and drain
  sc.append({op:'y'});
  const q2 = sc.loadQueue();
  expect(q2.length).toBe(2);
  const rep = sc.drain(()=>{});
  expect(rep.before).toBe(2);
  expect(rep.after).toBe(0);
});
