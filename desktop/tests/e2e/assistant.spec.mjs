import { _electron as electron, test, expect } from '@playwright/test';

test('assistant overlay opens', async () => {
  const app = await electron.launch({ args: ['.'] });
  const win = await app.firstWindow();
  const title = await win.title();
  expect(title).toBeTruthy();
  await app.close();
});