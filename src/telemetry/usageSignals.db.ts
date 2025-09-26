import { createPrismaTelemetryStore } from '@workbuoy/backend-telemetry';
import type { FeatureUsageEvent as TelemetryEvent } from '@workbuoy/backend-telemetry';
import { prisma } from '../core/db/prisma';

const store = createPrismaTelemetryStore(prisma);

/**
 * @deprecated Use createPrismaTelemetryStore from @workbuoy/backend-telemetry instead.
 */
export type FeatureUsageEvent = TelemetryEvent;

/**
 * @deprecated Use createPrismaTelemetryStore(prisma).recordFeatureUsage instead.
 */
export async function recordFeatureUsage(event: FeatureUsageEvent): Promise<void> {
  await store.recordFeatureUsage(event);
}

/**
 * @deprecated Use createPrismaTelemetryStore(prisma).aggregateFeatureUseCount instead.
 */
export async function aggregateFeatureUseCount(
  userId: string,
  tenantId?: string,
): Promise<Record<string, number>> {
  return store.aggregateFeatureUseCount(userId, tenantId);
}
