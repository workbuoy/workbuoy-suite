
import { test, expect } from '@playwright/test';
test('footer banner exists on portal pages', async ({ page })=>{
  for(const p of ['/portal','/portal/billing','/portal/connectors','/portal/users','/portal/settings','/portal/onboarding']){
    await page.goto(p);
    await expect(page.locator('text=Workbuoy kan gjøre feil')).toBeTruthy();
  }
});
