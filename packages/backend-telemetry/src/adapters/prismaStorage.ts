import type { TelemetryEvent, TelemetryStorage } from '../types.js';
import { Prisma, PrismaClient, FeatureUsageAction } from '@prisma/client';

// Keep this minimal: only require the model we use.
type PrismaClientLike = Pick<PrismaClient, 'featureUsage'>;

const toAction = (s: string): FeatureUsageAction => {
  const k = s?.toLowerCase?.() ?? '';
  if (k === 'open' || k === 'view' || k === 'start') return 'open';
  if (k === 'complete' || k === 'finish') return 'complete';
  if (k === 'dismiss' || k === 'error' || k === 'cancel') return 'dismiss';
  return 'open';
};

export function createPrismaTelemetryStorage(client: PrismaClientLike): TelemetryStorage {
  const storage: TelemetryStorage & {
    aggregateFeatureUseCount: (userId: string, tenantId?: string) => Promise<Record<string, number>>;
  } = {
    async record(ev: TelemetryEvent): Promise<void> {
      await client.featureUsage.create({
        data: {
          userId: ev.userId,
          tenantId: ev.tenantId,
          featureId: ev.featureId,
          action: toAction(ev.action),
          ts: new Date(),
          // Ensure metadata matches Prisma JSON type
          metadata: ev.metadata as Prisma.InputJsonValue,
        },
      });
    },
    async aggregateFeatureUseCount(userId: string, tenantId?: string) {
      const rows = await client.featureUsage.groupBy({
        by: ['featureId'],
        where: {
          userId,
          ...(tenantId ? { tenantId } : {}),
        },
        _count: { _all: true },
      });

      return rows.reduce<Record<string, number>>((acc, row) => {
        acc[row.featureId] = row._count._all;
        return acc;
      }, {});
    },
  };

  return storage;
}
