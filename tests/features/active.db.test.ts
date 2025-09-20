import request from 'supertest';
import app from '../../src/server';
import { prisma } from '../../src/core/db/prisma';

const persistenceEnabled = String(process.env.FF_PERSISTENCE ?? '').toLowerCase() === 'true';

(persistenceEnabled ? describe : describe.skip)('Active features ranking with persistence', () => {
  beforeEach(async () => {
    await (prisma as any).featureUsage.deleteMany?.();
    await (prisma as any).orgRoleOverride.deleteMany?.();
    await (prisma as any).userRole.deleteMany?.();
    await (prisma as any).role.deleteMany?.();
    await (prisma as any).feature.deleteMany?.();
  });

  it('ranks features using usage counts', async () => {
    await request(app).post('/api/admin/roles/import').set('x-tenant', 'TEN').set('x-roles', 'admin');

    await request(app)
      .post('/api/usage/feature')
      .set('x-tenant', 'TEN')
      .send({ userId: 'user', featureId: 'cashflow_forecast', action: 'open' });
    await request(app)
      .post('/api/usage/feature')
      .set('x-tenant', 'TEN')
      .send({ userId: 'user', featureId: 'cashflow_forecast', action: 'complete' });

    const res = await request(app)
      .get('/api/features/active')
      .set('x-tenant', 'TEN')
      .set('x-user', 'user')
      .set('x-role', 'sales-junior-account-executive');

    expect(res.status).toBe(200);
    expect(res.body.features?.length).toBeGreaterThan(0);
    expect(res.body.features[0].id).toBe('cashflow_forecast');
  });
});
