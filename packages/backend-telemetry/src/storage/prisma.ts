import type { PrismaClient, Prisma, FeatureUsageAction } from '@prisma/client';
import type { TelemetryEvent, TelemetryStorage } from '../types.js';

type PrismaTelemetryStorage = TelemetryStorage & {
  aggregateFeatureUseCount: (userId: string, tenantId?: string) => Promise<Record<string, number>>;
};

let sharedClient: PrismaClient | undefined;

async function getClient(): Promise<PrismaClient> {
  if (sharedClient) {
    return sharedClient;
  }
  const { PrismaClient } = await import('@prisma/client');
  sharedClient = new PrismaClient();
  return sharedClient;
}

const toAction = (input: string): FeatureUsageAction => {
  const value = input?.toLowerCase?.() ?? '';
  if (value === 'open' || value === 'view' || value === 'start') {
    return 'open';
  }
  if (value === 'complete' || value === 'finish') {
    return 'complete';
  }
  if (value === 'dismiss' || value === 'error' || value === 'cancel') {
    return 'dismiss';
  }
  return 'open';
};

export function createPrismaTelemetryStorage(existingClient?: PrismaClient): PrismaTelemetryStorage {
  const resolveClient = async () => {
    if (existingClient) {
      return existingClient;
    }
    return getClient();
  };

  const storage: PrismaTelemetryStorage = {
    async record(event: TelemetryEvent): Promise<void> {
      const prisma = await resolveClient();
      await prisma.featureUsage.create({
        data: {
          userId: event.userId,
          tenantId: event.tenantId,
          featureId: event.featureId,
          action: toAction(event.action),
          ts: new Date(event.ts),
          metadata: event.metadata as
            | Prisma.InputJsonValue
            | Prisma.NullableJsonNullValueInput
            | undefined,
        },
      });
    },
    async aggregateFeatureUseCount(userId: string, tenantId?: string) {
      const prisma = await resolveClient();
      const rows = await prisma.featureUsage.groupBy({
        by: ['featureId'],
        where: {
          userId,
          ...(tenantId ? { tenantId } : {}),
        },
        _count: { _all: true },
      });

      const totals: Record<string, number> = {};
      for (const row of rows) {
        const total = row._count?._all ?? 0;
        totals[row.featureId] = total;
      }

      return totals;
    },
  };

  return storage;
}
