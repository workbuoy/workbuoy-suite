import { _electron as electron, test, expect } from '@playwright/test';
test('RBAC denies plugin enable without policy', async()=>{
  const app = await electron.launch({ args:['.'] });
  const win = await app.firstWindow();
  const res = await win.evaluate(async ()=> await window.wbDesktop.pluginsToggle({ key:'hubspot', enabled:true }));
  expect(res.ok).toBeFalsy();
  await app.close();
});
