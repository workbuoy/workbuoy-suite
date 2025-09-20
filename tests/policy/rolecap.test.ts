import { RoleRegistry } from '../../src/roles/registry';
import { policyCheckRoleAware } from '../../src/core/policyRoleAware';
import { ProactivityMode } from '../../src/core/proactivity/modes';

const rr = new RoleRegistry(
  [
    { role_id: 'sales_rep', canonical_title: 'Sales Rep', featureCaps: { 'crm': 3 } },
  ] as any,
  [
    { id: 'crm', title: 'CRM', capabilities: ['demo'], defaultAutonomyCap: 3 },
  ],
  []
);

describe('policy role cap enforcement', () => {
  it('degrades requested mode beyond role cap', async () => {
    const policySpy = jest.fn(async () => ({ allowed: true, basis: ['policy:allow'] }));
    const result = await policyCheckRoleAware(
      { capability: 'demo', featureId: 'crm' },
      { tenantId: 'TEN', roleBinding: { userId: 'user', primaryRole: 'sales_rep' }, requestedMode: ProactivityMode.Tsunami },
      rr,
      policySpy
    );

    expect(result.proactivity.effective).toBe(ProactivityMode.Proaktiv);
    expect(result.proactivity.basis).toEqual(expect.arrayContaining(['roleCap:crm=3', 'degraded:role:crm']));
    expect(policySpy).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ autonomy_level: ProactivityMode.Proaktiv })
    );
  });
});
