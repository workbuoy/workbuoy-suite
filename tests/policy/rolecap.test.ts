import { RoleRegistry } from '../../src/roles/registry';
import { policyCheckRoleAware } from '../../src/core/policyRoleAware';

const roles = [
  { role_id:'sales_rep', canonical_title:'Sales Rep', featureCaps:{ lead_qualification:5 } },
  { role_id:'cfo', canonical_title:'CFO', featureCaps:{ cashflow_forecast:3 } }
] as any;

const features = [
  { id:'lead_qualification', title:'Lead Qualification', defaultAutonomyCap:5, capabilities:['crm.email.send'] },
  { id:'cashflow_forecast', title:'Cashflow', defaultAutonomyCap:3, capabilities:['finance.cashflow.forecast'] }
] as any;

async function allow(){ return { allowed: true, basis:['ok'] }; }

test('sales_rep L=5 allowed for lead_qualification (crm.email.send)', async () => {
  const rr = new RoleRegistry(roles, features, []);
  const res = await policyCheckRoleAware(
    { capability:'crm.email.send' },
    { autonomy_level: 5, tenantId:'DEV', roleBinding:{ userId:'u1', primaryRole:'sales_rep' } },
    rr, allow);
  expect(res.allowed).toBe(true);
});

test('cfo L=4 blocked for cashflow_forecast', async () => {
  const rr = new RoleRegistry(roles, features, []);
  const res = await policyCheckRoleAware(
    { capability:'finance.cashflow.forecast' },
    { autonomy_level: 4, tenantId:'DEV', roleBinding:{ userId:'u2', primaryRole:'cfo' } },
    rr, allow);
  expect(res.allowed).toBe(false);
  expect(res.basis?.some(b=>b.startsWith('roleCap:'))).toBe(true);
});
