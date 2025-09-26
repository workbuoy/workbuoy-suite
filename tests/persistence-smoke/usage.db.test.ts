import { prisma } from '../../src/core/db/prisma';
import { createPrismaTelemetryStorage } from '@workbuoy/backend-telemetry';

const store = createPrismaTelemetryStorage(prisma);

test.skip('record and aggregate usage (DB)', async () => {
  await store.record({
    userId: 'u1',
    tenantId: 'DEV',
    featureId: 'f1',
    action: 'open',
    ts: new Date(),
  });
  // aggregate assertions here
});
