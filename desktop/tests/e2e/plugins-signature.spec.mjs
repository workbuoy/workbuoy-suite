import { _electron as electron, test, expect } from '@playwright/test';
test('plugin enable blocked on invalid signature', async()=>{
  const app = await electron.launch({ args:['.'] });
  const win = await app.firstWindow();
  const res = await win.evaluate(async ()=> await window.wbDesktop.pluginsToggle({ key:'google-calendar', enabled:true }));
  expect(res.ok).toBeFalsy();
  await app.close();
});
