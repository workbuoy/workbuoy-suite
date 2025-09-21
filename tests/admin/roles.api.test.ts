import request from 'supertest';
import type { Application } from 'express';
import { prisma } from '../../src/core/db/prisma';

const describeIfPersistence = process.env.FF_PERSISTENCE === 'true' ? describe : describe.skip;

const tenantId = 'TENANT_ADMIN_API';
const roleId = 'sales-manager-account-executive';

let app: Application;

describeIfPersistence('Admin roles API', () => {
  beforeAll(async () => {
    process.env.FF_PERSISTENCE = 'true';
    await prisma.$connect();
    await prisma.featureUsage.deleteMany();
    await prisma.orgRoleOverride.deleteMany();
    await prisma.userRole.deleteMany();
    await prisma.role.deleteMany();
    await prisma.feature.deleteMany();
    app = (await import('../../src/server')).default;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('imports roles and manages overrides', async () => {
    const importRes = await request(app)
      .post('/api/admin/roles/import')
      .set('x-role-id', 'admin')
      .send();
    expect(importRes.status).toBe(200);
    expect(importRes.body.imported.roles).toBeGreaterThan(0);

    const initialInspect = await request(app)
      .get(`/api/admin/roles/${roleId}`)
      .set('x-role-id', 'admin')
      .set('x-tenant', tenantId);
    expect(initialInspect.status).toBe(200);
    expect(initialInspect.body.effective.featureCaps).toBeDefined();

    const overrideRes = await request(app)
      .put(`/api/admin/roles/${roleId}/overrides`)
      .set('x-role-id', 'admin')
      .set('x-tenant', tenantId)
      .send({ featureCaps: { cashflow_forecast: 4 }, disabledFeatures: ['contract_compliance'] });
    expect(overrideRes.status).toBe(200);
    expect(overrideRes.body.override.featureCaps.cashflow_forecast).toBe(4);

    const finalInspect = await request(app)
      .get(`/api/admin/roles/${roleId}`)
      .set('x-role-id', 'admin')
      .set('x-tenant', tenantId);
    expect(finalInspect.status).toBe(200);
    expect(finalInspect.body.override?.featureCaps.cashflow_forecast).toBe(4);
    expect(finalInspect.body.effective.featureCaps.cashflow_forecast).toBe(4);
  });
});
