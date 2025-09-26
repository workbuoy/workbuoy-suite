import type { TelemetryEvent, TelemetryStorage } from '../types.js';
import { Prisma } from '@prisma/client';
import type { PrismaClient } from '@prisma/client';

type FeatureUsageAction = 'INVOKE' | 'STREAM' | 'CACHE_HIT' | 'CACHE_MISS';

const toJsonInput = (v: unknown): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput =>
  v === null ? Prisma.JsonNull : (v as Prisma.InputJsonValue);

// Keep this minimal: only require the model we use.
type PrismaClientLike = Pick<PrismaClient, 'featureUsage'>;

const toAction = (s: string): FeatureUsageAction => {
  const k = s?.toLowerCase?.() ?? '';
  if (k === 'open' || k === 'view' || k === 'start') return 'INVOKE';
  if (k === 'complete' || k === 'finish') return 'STREAM';
  if (k === 'cache_hit') return 'CACHE_HIT';
  if (k === 'dismiss' || k === 'error' || k === 'cancel') return 'CACHE_MISS';
  return 'INVOKE';
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
          metadata: toJsonInput(ev.metadata),
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

      return rows.reduce<Record<string, number>>((acc: Record<string, number>, row: (typeof rows)[number]) => {
        acc[row.featureId] = row._count._all;
        return acc;
      }, {});
    },
  };

  return storage;
}
