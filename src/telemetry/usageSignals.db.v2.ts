import { selectRepo } from '../core/persist/select';

export type UsageEvt = { userId: string; featureId: string; action: 'open'|'complete'|'dismiss'; ts?: string };

export async function recordFeatureUsage(evt: UsageEvt){
  try {
    if (process.env.FF_PERSISTENCE === 'true') {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      await prisma.featureUsage.create({ data: { id: crypto.randomUUID(), user_id: evt.userId, feature_id: evt.featureId, action: evt.action, ts: new Date() } });
      await prisma.$disconnect();
      return;
    }
  } catch {}
  const repo = selectRepo<any>('feature_usage');
  await repo.upsert({ id: String(Date.now()), user_id: evt.userId, feature_id: evt.featureId, action: evt.action, ts: new Date().toISOString() } as any);
}

export async function aggregateFeatureUseCount(userId: string){
  try {
    if (process.env.FF_PERSISTENCE === 'true') {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      const rows = await prisma.$queryRawUnsafe(`
        SELECT feature_id, COUNT(*)::int AS cnt
        FROM "FeatureUsage"
        WHERE user_id = $1
        GROUP BY feature_id
        ORDER BY cnt DESC
      `, userId);
      await prisma.$disconnect();
      return rows as Array<{feature_id:string,cnt:number}>;
    }
  } catch {}
  const repo = selectRepo<any>('feature_usage');
  const all = await repo.all() as any[];
  const map: Record<string, number> = {};
  for (const r of all.filter(r => r.user_id === userId)) {
    map[r.feature_id] = (map[r.feature_id] || 0) + 1;
  }
  return Object.entries(map).map(([feature_id,cnt]) => ({ feature_id, cnt }));
}
