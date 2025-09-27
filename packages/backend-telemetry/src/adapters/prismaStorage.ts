import type { FeatureUsageAction, Prisma, PrismaClient } from '@prisma/client';
import { toPrismaJson } from '../lib/prismaJson.js';
import type { TelemetryEvent, TelemetryStorage } from '../types.js';

// Keep this minimal: only require the model we use.
type PrismaClientLike = Pick<PrismaClient, 'featureUsage'>;

const toAction = (input: string): FeatureUsageAction => {
  const value = input?.toLowerCase?.() ?? '';
  if (value === 'open' || value === 'view' || value === 'start') return 'open';
  if (value === 'complete' || value === 'finish') return 'complete';
  if (value === 'dismiss' || value === 'error' || value === 'cancel') return 'dismiss';
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
          metadata: toPrismaJson(ev.metadata) as Prisma.InputJsonValue,
        },
      });
    },
    async aggregateFeatureUseCount(userId: string, tenantId?: string) {
      const groupByArgs = {
        by: ['featureId'],
        where: {
          userId,
          ...(tenantId ? { tenantId } : {}),
        },
        _count: { _all: true },
      } satisfies Prisma.FeatureUsageGroupByArgs;

      const rows = await client.featureUsage.groupBy(groupByArgs);

      const result = rows.reduce<Record<string, number>>((acc, row) => {
        const total = typeof row._count === 'object' && row._count ? row._count._all ?? 0 : 0;
        acc[row.featureId] = total;
        return acc;
      }, {});

      return result;
    },
  };

  return storage;
}
