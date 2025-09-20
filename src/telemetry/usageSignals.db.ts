import { FeatureUsageAction } from '@prisma/client';
import { prisma } from '../core/db/prisma';

export interface FeatureUsageEvent {
  userId: string;
  tenantId: string;
  featureId: string;
  action: FeatureUsageAction | 'open' | 'complete' | 'dismiss';
  ts?: Date;
  metadata?: Record<string, unknown>;
}

export async function recordFeatureUsage(evt: FeatureUsageEvent): Promise<void> {
  await prisma.featureUsage.create({
    data: {
      userId: evt.userId,
      tenantId: evt.tenantId,
      featureId: evt.featureId,
      action: evt.action as FeatureUsageAction,
      ts: evt.ts ?? new Date(),
      metadata: evt.metadata,
    },
  });
}

export async function aggregateFeatureUseCount(userId: string, tenantId?: string): Promise<Record<string, number>> {
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
  return rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.featureId] = row._count._all;
    return acc;
  }, {});
}
