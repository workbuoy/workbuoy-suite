import request from 'supertest';
import type { Application } from 'express';
import { prisma } from '../../src/core/db/prisma';
import { importRolesAndFeatures, setOverride } from '../../src/roles/service';
import { loadRolesFromRepo, loadFeaturesFromRepo } from '../../src/roles/loader';
import { recordFeatureUsage } from '../../src/telemetry/usageSignals.db';

const describeIfPersistence = process.env.FF_PERSISTENCE === 'true' ? describe : describe.skip;

const tenantId = 'TENANT_ACTIVE_FEATURES';
const roleId = 'sales-manager-account-executive';
const userId = 'user-active';

let app: Application;

describeIfPersistence('GET /api/features/active', () => {
  beforeAll(async () => {
    process.env.FF_PERSISTENCE = 'true';
    await prisma.$connect();
    await prisma.featureUsage.deleteMany();
    await prisma.orgRoleOverride.deleteMany();
    await prisma.userRole.deleteMany();
    await prisma.role.deleteMany();
    await prisma.feature.deleteMany();
    await importRolesAndFeatures(loadRolesFromRepo(), loadFeaturesFromRepo());
    await setOverride(tenantId, roleId, { featureCaps: { cashflow_forecast: 5, lead_qualification: 3 } });
    await recordFeatureUsage({ userId, tenantId, featureId: 'lead_qualification', action: 'open' });
    await recordFeatureUsage({ userId, tenantId, featureId: 'lead_qualification', action: 'open' });
    await recordFeatureUsage({ userId, tenantId, featureId: 'cashflow_forecast', action: 'complete' });
    app = (await import('../../src/server')).default;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('ranks features using autonomy caps, usage and org context', async () => {
    const res = await request(app)
      .get('/api/features/active')
      .set('x-tenant', tenantId)
      .set('x-user', userId)
      .set('x-role', roleId)
      .set('x-industry', 'finance');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].id).toBe('cashflow_forecast');
    const lead = res.body.find((f: any) => f.id === 'lead_qualification');
    expect(lead).toBeDefined();
    expect(res.body[0].score).toBeGreaterThan(lead.score);
    expect(lead.rankBasis.usage).toBe(2);
  });
});
