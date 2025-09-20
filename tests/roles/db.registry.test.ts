import { prisma } from '../../src/core/db/prisma';
import { RoleRepo } from '../../src/roles/db/RoleRepo';
import { FeatureRepo } from '../../src/roles/db/FeatureRepo';
import { OverrideRepo } from '../../src/roles/db/OverrideRepo';
import { getRoleRegistry } from '../../src/roles/registryProvider';

const persistenceEnabled = String(process.env.FF_PERSISTENCE ?? '').toLowerCase() === 'true';

(persistenceEnabled ? describe : describe.skip)('Role registry DB integration', () => {
  const roleRepo = new RoleRepo();
  const featureRepo = new FeatureRepo();
  const overrideRepo = new OverrideRepo();

  beforeEach(async () => {
    await (prisma as any).orgRoleOverride.deleteMany?.();
    await (prisma as any).userRole.deleteMany?.();
    await (prisma as any).role.deleteMany?.();
    await (prisma as any).feature.deleteMany?.();
  });

  it('merges feature caps and tenant overrides', async () => {
    await featureRepo.upsertMany([
      { id: 'forecast', title: 'Forecast', defaultAutonomyCap: 3, capabilities: ['demo.cap'] },
      { id: 'insights', title: 'Insights', defaultAutonomyCap: 4, capabilities: ['demo.other'] },
    ]);
    await roleRepo.upsertMany([
      {
        role_id: 'sales_rep',
        canonical_title: 'Sales Rep',
        featureCaps: { forecast: 4, insights: 3 },
      } as any,
    ]);
    await overrideRepo.upsertOverride('TENANT', 'sales_rep', {
      tenantId: 'TENANT',
      role_id: 'sales_rep',
      featureCaps: { forecast: 2 },
      disabledFeatures: ['insights'],
    });

    const registry = await getRoleRegistry(true);
    const ctx = registry.getUserContext('TENANT', { userId: 'u1', primaryRole: 'sales_rep' });
    expect(ctx.featureCaps.forecast).toBe(2);
    expect(ctx.features.find(f => f.id === 'forecast')).toBeTruthy();
    expect(ctx.features.find(f => f.id === 'insights')).toBeUndefined();
  });
});
