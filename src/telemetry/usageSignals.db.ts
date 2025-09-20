import { prisma as defaultClient } from '../core/db/prisma';
import type { FeatureUsage } from './usageSignals';

type AggregationResult = Record<string, number>;

function normalizeEvent(evt: FeatureUsage) {
  return {
    id: evt.id ?? undefined,
    tenantId: evt.tenantId ?? null,
    userId: evt.userId,
    featureId: evt.featureId,
    action: evt.action,
    ts: new Date(evt.ts ?? new Date().toISOString()),
    metadata: evt.metadata ?? null,
  };
}

export async function recordFeatureUsageDb(evt: FeatureUsage, client: typeof defaultClient = defaultClient): Promise<void> {
  const data = normalizeEvent(evt);
  await (client as any).featureUsage.create({ data: { ...data, id: data.id ?? undefined } });
}

export async function aggregateFeatureUseCountDb(
  userId: string,
  tenantId?: string,
  client: typeof defaultClient = defaultClient
): Promise<AggregationResult> {
  const where: Record<string, any> = { userId };
  if (tenantId) where.tenantId = tenantId;
  const rows = await (client as any).featureUsage.groupBy({
    by: ['featureId'],
    where,
    _count: { featureId: true },
  });
  return rows.reduce((acc: AggregationResult, row: any) => {
    acc[row.featureId] = Number(row._count?.featureId ?? 0);
    return acc;
  }, {} as AggregationResult);
}
