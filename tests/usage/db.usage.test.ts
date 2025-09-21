import { prisma } from '../../src/core/db/prisma';
import { recordFeatureUsage, aggregateFeatureUseCount } from '../../src/telemetry/usageSignals.db';

const describeIfPersistence = process.env.FF_PERSISTENCE === 'true' ? describe : describe.skip;

describeIfPersistence('Feature usage persistence', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  beforeEach(async () => {
    await prisma.featureUsage.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('records and aggregates per tenant/user', async () => {
    await recordFeatureUsage({ userId: 'u1', tenantId: 'T1', featureId: 'cashflow_forecast', action: 'open' });
    await recordFeatureUsage({ userId: 'u1', tenantId: 'T1', featureId: 'cashflow_forecast', action: 'complete' });
    await recordFeatureUsage({ userId: 'u1', tenantId: 'T2', featureId: 'cashflow_forecast', action: 'dismiss' });
    const tenantCounts = await aggregateFeatureUseCount('u1', 'T1');
    expect(tenantCounts.cashflow_forecast).toBe(2);
    const allCounts = await aggregateFeatureUseCount('u1');
    expect(allCounts.cashflow_forecast).toBe(3);
  });
});
