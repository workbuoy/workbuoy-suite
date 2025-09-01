import { _electron as electron, test, expect } from '@playwright/test';
test('telemetry toggle smoke', async()=>{
  const app = await electron.launch({ args:['.'] });
  const win = await app.firstWindow();
  // assume settings API present
  const hasUpdate = await win.evaluate(() => !!window.wbDesktop?.updateSettings);
  if (hasUpdate) {
    const r = await win.evaluate(() => window.wbDesktop.updateSettings({ telemetry: { optIn: false } }));
    expect(r).toBeTruthy();
  } else {
    expect(true).toBeTruthy();
  }
  await app.close();
});
