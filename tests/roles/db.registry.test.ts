import { prisma } from '../../src/core/db/prisma';
import { loadRolesFromRepo, loadFeaturesFromRepo } from '../../src/roles/loader';
import { getRoleRegistry, importRolesAndFeatures, setOverride } from '../../src/roles/service';

const describeIfPersistence = process.env.FF_PERSISTENCE === 'true' ? describe : describe.skip;

const tenantId = 'TENANT_REGISTRY_TEST';
const roleId = 'sales-manager-account-executive';

async function resetDb() {
  await prisma.featureUsage.deleteMany();
  await prisma.orgRoleOverride.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.role.deleteMany();
  await prisma.feature.deleteMany();
}

describeIfPersistence('RoleRegistry with Postgres persistence', () => {
  beforeAll(async () => {
    await prisma.$connect();
    await resetDb();
    await importRolesAndFeatures(loadRolesFromRepo(), loadFeaturesFromRepo());
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('override updates effective feature caps', async () => {
    await setOverride(tenantId, roleId, { featureCaps: { lead_qualification: 2 } });
    const registry = await getRoleRegistry({ refresh: true });
    const binding = { userId: 'user-1', primaryRole: roleId };
    const ctx = registry.getUserContext(tenantId, binding);
    expect(ctx.roles.some(r => r.role_id === roleId)).toBe(true);
    expect(ctx.featureCaps.lead_qualification).toBe(2);
    expect(registry.getFeatureCap(tenantId, binding, 'lead_qualification')).toBe(2);
  });
});
