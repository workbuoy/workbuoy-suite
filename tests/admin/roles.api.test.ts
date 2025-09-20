import request from 'supertest';
import app from '../../src/server';
import { prisma } from '../../src/core/db/prisma';

const persistenceEnabled = String(process.env.FF_PERSISTENCE ?? '').toLowerCase() === 'true';

(persistenceEnabled ? describe : describe.skip)('Admin roles API', () => {
  beforeEach(async () => {
    await (prisma as any).orgRoleOverride.deleteMany?.();
    await (prisma as any).role.deleteMany?.();
    await (prisma as any).feature.deleteMany?.();
  });

  it('rejects non-admin callers', async () => {
    const res = await request(app).post('/api/admin/roles/import').set('x-tenant', 'TEN');
    expect(res.status).toBe(403);
  });

  it('imports roles and applies tenant overrides', async () => {
    const importRes = await request(app)
      .post('/api/admin/roles/import')
      .set('x-tenant', 'TEN')
      .set('x-roles', 'admin')
      .send();
    expect(importRes.status).toBe(200);
    expect(importRes.body.summary.roles).toBeGreaterThan(0);

    const roleId = 'sales-junior-account-executive';
    const overrideRes = await request(app)
      .put(`/api/admin/roles/${roleId}/overrides`)
      .set('x-tenant', 'TEN')
      .set('x-roles', 'admin')
      .send({ featureCaps: { cashflow_forecast: 5 }, disabledFeatures: ['contract_compliance'] });
    expect(overrideRes.status).toBe(200);

    const viewRes = await request(app)
      .get(`/api/admin/roles/${roleId}`)
      .set('x-tenant', 'TEN')
      .set('x-roles', 'admin');
    expect(viewRes.status).toBe(200);
    expect(viewRes.body.featureCaps.cashflow_forecast).toBe(5);
    expect(viewRes.body.override?.disabledFeatures).toContain('contract_compliance');
  });
});
