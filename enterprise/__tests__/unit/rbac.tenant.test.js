import { enforceTenant } from '../../lib/secure/rbac.js';
test('tenant enforcement denies cross-tenant access', ()=>{
  const user = { tenant_id:'t1', roles:['agent'] };
  expect(()=>enforceTenant(user,'t2')).toThrow();
});
