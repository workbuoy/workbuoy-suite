import type { TelemetryEvent, TelemetryStorage } from '../types.js';
import { Prisma, PrismaClient, FeatureUsageAction } from '@prisma/client';

// Keep this minimal: only require the model we use.
type PrismaClientLike = Pick<PrismaClient, 'featureUsage'>;

function toActionEnum(action: string): FeatureUsageAction {
  // Map common strings; fall back to a safe default if unknown
  const map: Record<string, FeatureUsageAction> = {
    view: FeatureUsageAction.VIEW ?? (FeatureUsageAction as any).View,
    click: FeatureUsageAction.CLICK ?? (FeatureUsageAction as any).Click,
    start: FeatureUsageAction.START ?? (FeatureUsageAction as any).Start,
    finish: FeatureUsageAction.FINISH ?? (FeatureUsageAction as any).Finish,
    error: FeatureUsageAction.ERROR ?? (FeatureUsageAction as any).Error,
  };
  const upper = action?.toLowerCase();
  const candidate = map[upper];
  if (candidate) return candidate;
  // Try direct enum key match (covers codegen variants)
  if ((FeatureUsageAction as any)[action]) return (FeatureUsageAction as any)[action];
  // Final fallback to a generic action if present, else VIEW
  return (
    (FeatureUsageAction as any).OTHER ??
    (FeatureUsageAction as any).Unknown ??
    (FeatureUsageAction as any).VIEW ??
    FeatureUsageAction.VIEW
  );
}

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
          action: toActionEnum(ev.action),
          ts: ev.ts,
          // Ensure metadata matches Prisma JSON type
          metadata: ev.metadata as Prisma.InputJsonValue,
        },
      });
    },
    async aggregateFeatureUseCount(userId: string, tenantId?: string) {
      const rows = (await client.featureUsage.groupBy({
        by: ['featureId'],
        where: {
          userId,
          ...(tenantId ? { tenantId } : {}),
        },
        _count: { _all: true },
      })) as Array<{ featureId: string; _count: { _all: number } }>;

      return rows.reduce<Record<string, number>>((acc, row) => {
        acc[row.featureId] = row._count._all;
        return acc;
      }, {});
    },
  };

  return storage;
}
