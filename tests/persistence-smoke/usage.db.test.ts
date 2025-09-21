import { recordFeatureUsage } from '../../src/telemetry/usageSignals.db.v2';

test.skip('record and aggregate usage (DB)', async () => {
  await recordFeatureUsage({ userId: 'u1', featureId: 'f1', action: 'open' });
  // aggregate assertions here
});
