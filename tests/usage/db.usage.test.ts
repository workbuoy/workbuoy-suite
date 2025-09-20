import { prisma } from '../../src/core/db/prisma';
import { recordFeatureUsage, aggregateFeatureUseCount, resetUsageStore } from '../../src/telemetry/usageSignals';

const persistenceEnabled = String(process.env.FF_PERSISTENCE ?? '').toLowerCase() === 'true';

(persistenceEnabled ? describe : describe.skip)('Feature usage persistence', () => {
  beforeEach(async () => {
    resetUsageStore();
    await (prisma as any).featureUsage.deleteMany?.();
  });

  it('records and aggregates usage events per feature', async () => {
    await recordFeatureUsage({ tenantId: 'TEN', userId: 'user-1', featureId: 'forecast', action: 'open' });
    await recordFeatureUsage({ tenantId: 'TEN', userId: 'user-1', featureId: 'forecast', action: 'complete' });
    await recordFeatureUsage({ tenantId: 'TEN', userId: 'user-1', featureId: 'insights', action: 'open' });

    const counts = await aggregateFeatureUseCount('user-1', 'TEN');
    expect(counts.forecast).toBe(2);
    expect(counts.insights).toBe(1);
  });
});
