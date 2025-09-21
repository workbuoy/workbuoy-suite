import { prisma } from '../../src/core/db/prisma';
import { importRolesAndFeatures, setOverride, getRoleRegistry } from '../../src/roles/service';
import { loadRolesFromRepo, loadFeaturesFromRepo } from '../../src/roles/loader';
import { buildProactivityContext } from '../../src/core/proactivity/context';
import { ProactivityMode } from '../../src/core/proactivity/modes';
import { setSubscriptionForTenant, resetSubscriptionState } from '../../src/core/subscription/state';

const describeIfPersistence = process.env.FF_PERSISTENCE === 'true' ? describe : describe.skip;

const tenantId = 'TENANT_PROACTIVITY';
const roleId = 'sales-manager-account-executive';

describeIfPersistence('Proactivity context integration', () => {
  beforeAll(async () => {
    process.env.FF_PERSISTENCE = 'true';
    await prisma.$connect();
    await prisma.featureUsage.deleteMany();
    await prisma.orgRoleOverride.deleteMany();
    await prisma.userRole.deleteMany();
    await prisma.role.deleteMany();
    await prisma.feature.deleteMany();
    await importRolesAndFeatures(loadRolesFromRepo(), loadFeaturesFromRepo());
    await setOverride(tenantId, roleId, { featureCaps: { cashflow_forecast: 5 } });
  });

  afterAll(async () => {
    resetSubscriptionState();
    await prisma.$disconnect();
  });

  test('effective mode respects role, subscription and policy caps', async () => {
    setSubscriptionForTenant(tenantId, { plan: 'secure', secureTenant: true, killSwitch: false });
    const registry = await getRoleRegistry({ refresh: true });
    const binding = { userId: 'proactivity-user', primaryRole: roleId };
    const state = buildProactivityContext({
      tenantId,
      roleRegistry: registry,
      roleBinding: binding,
      featureId: 'cashflow_forecast',
      requestedMode: ProactivityMode.Tsunami,
      policyCap: ProactivityMode.Rolig,
    });

    expect(state.effective).toBe(ProactivityMode.Rolig);
    expect(state.basis).toEqual(expect.arrayContaining([
      'tenantPlan:secure',
      'tenant<=3',
      'roleCap:cashflow_forecast=5',
      'degraded:rolig',
      'cap:policy:rolig',
    ]));
    expect(state.basis).not.toContain('kill');
  });
});
