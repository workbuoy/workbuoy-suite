// Minimal Playwright Electron smoke test
import { _electron as electron } from 'playwright';
import path from 'node:path';
import assert from 'node:assert';

const APP_DIR = path.resolve(process.cwd());

(async () => {
  const app = await electron.launch({ args: [APP_DIR] });
  const window = await app.firstWindow();
  const title = await window.title();
  assert.ok(title.includes('WorkBuoy'), 'Window title should include WorkBuoy');
  await app.close();
  console.log('OK');
})().catch(err => { console.error(err); process.exit(1); });