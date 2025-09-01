import { _electron as electron, test, expect } from '@playwright/test';
test('org switch smoke', async()=>{
  const app = await electron.launch({ args:['.'] });
  const win = await app.firstWindow();
  const orgs = await win.evaluate(()=> window.wbDesktop.orgList?.());
  expect(orgs).toBeTruthy();
  await app.close();
});
