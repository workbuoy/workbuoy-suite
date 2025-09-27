import type { PrismaClient as PrismaClientType } from '@prisma/client';
import type { TelemetryEvent, TelemetryStorage } from '../types.js';

// Keep this minimal: only require the model we use.
type PrismaClientLike = Pick<PrismaClientType, 'featureUsage'>;

const toPrismaJson = (value: unknown): any => (value === null ? (null as any) : (value as any));

const toAction = (input: string): string => {
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
          action: toAction(ev.action) as any,
          ts: new Date(),
          metadata: toPrismaJson(ev.metadata),
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

      const initial = {} as Record<string, number>;
      const result = (rows as any[]).reduce((acc: any, row: any) => {
        acc[row.featureId] = row._count._all;
        return acc;
      }, initial as any);

      return result as Record<string, number>;
    },
  };

  return storage;
}
