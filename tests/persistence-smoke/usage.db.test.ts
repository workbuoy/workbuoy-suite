import { prisma } from '../../src/core/db/prisma';
import { createPrismaTelemetryStore } from '@workbuoy/backend-telemetry';

const store = createPrismaTelemetryStore(prisma);

test.skip('record and aggregate usage (DB)', async () => {
  await store.recordFeatureUsage({ userId: 'u1', tenantId: 'DEV', featureId: 'f1', action: 'open' });
  // aggregate assertions here
});
