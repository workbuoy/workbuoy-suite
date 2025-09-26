import { createPrismaTelemetryStorage } from '@workbuoy/backend-telemetry';
import type { TelemetryEvent } from '@workbuoy/backend-telemetry';
import { prisma } from '../core/db/prisma';

const store = createPrismaTelemetryStorage(prisma);

/**
 * @deprecated Use createPrismaTelemetryStorage from @workbuoy/backend-telemetry instead.
 */
export type FeatureUsageEvent = TelemetryEvent;

/**
 * @deprecated Use createPrismaTelemetryStorage(prisma).record instead.
 */
export async function recordFeatureUsage(event: FeatureUsageEvent): Promise<void> {
  await store.record(event);
}

/**
 * @deprecated Use createPrismaTelemetryStorage(prisma).aggregateFeatureUseCount instead.
 */
export async function aggregateFeatureUseCount(
  userId: string,
  tenantId?: string,
): Promise<Record<string, number>> {
  const aggregate = (store as any).aggregateFeatureUseCount;
  if (typeof aggregate === 'function') {
    return aggregate.call(store, userId, tenantId);
  }
  return {};
}
