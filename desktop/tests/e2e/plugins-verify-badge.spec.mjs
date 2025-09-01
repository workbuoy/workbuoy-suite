import { _electron as electron, test, expect } from '@playwright/test';
test('Plugin badge uses verify result', async()=>{
  const app = await electron.launch({ args:['.'] });
  const win = await app.firstWindow();
  const v = await win.evaluate(async ()=> await window.wbDesktop.pluginsVerify({ key:'google-calendar' }));
  expect(v.ok).toBeFalsy();
  await app.close();
});
