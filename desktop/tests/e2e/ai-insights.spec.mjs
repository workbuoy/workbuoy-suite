import { _electron as electron, test, expect } from '@playwright/test';
test('AI insights dashboard window renders metrics snapshot', async()=>{
  const app = await electron.launch({ args:['.'] });
  const win = await app.firstWindow();
  // Request metrics snapshot via IPC to simulate dashboard data source
  const m = await win.evaluate(async ()=> await window.wbDesktop.metricsSnapshot());
  expect(m).toBeTruthy();
  await app.close();
});
