import type { TelemetryStore } from '../types.js';

interface FeatureUsageCreateArgs {
  data: {
    userId: string;
    tenantId: string;
    featureId: string;
    action: string;
    ts: Date;
    metadata?: Record<string, unknown>;
  };
}

interface FeatureUsageGroupByArgs {
  by: ['featureId'];
  where: {
    userId: string;
    tenantId?: string;
  };
  _count: {
    _all: true;
  };
}

interface FeatureUsageGroupByRow {
  featureId: string;
  _count: {
    _all: number;
  };
}

export interface PrismaClientLike {
  featureUsage: {
    create(args: FeatureUsageCreateArgs): Promise<unknown>;
    groupBy(args: FeatureUsageGroupByArgs): Promise<FeatureUsageGroupByRow[]>;
  };
}

function resolveTenantId(tenantId?: string): string {
  return tenantId ?? 'DEV';
}

export function createPrismaTelemetryStore(prisma: PrismaClientLike): TelemetryStore {
  return {
    async recordFeatureUsage(event) {
      await prisma.featureUsage.create({
        data: {
          userId: event.userId,
          tenantId: resolveTenantId(event.tenantId),
          featureId: event.featureId,
          action: event.action,
          ts: event.ts ?? new Date(),
          metadata: event.metadata,
        },
      });
    },
    async aggregateFeatureUseCount(userId, tenantId) {
      const rows = await prisma.featureUsage.groupBy({
        by: ['featureId'],
        where: {
          userId,
          ...(tenantId ? { tenantId } : {}),
        },
        _count: {
          _all: true,
        },
      });

      const counts: Record<string, number> = {};
      for (const row of rows) {
        counts[row.featureId] = row._count._all;
      }
      return counts;
    },
  };
}
