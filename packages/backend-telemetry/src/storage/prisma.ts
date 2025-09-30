import { toPrismaJson } from '../lib/prismaJson.js';
import type { TelemetryEvent, TelemetryStorage } from '../types.js';

type PrismaFeatureUsageAction = 'open' | 'complete' | 'dismiss';

type FeatureUsageRow = {
  featureId: string;
  _count?: { _all?: number } | number | null | undefined;
};

type FeatureUsageCreateArgs = {
  data: {
    userId: string;
    tenantId: string;
    featureId: string;
    action: PrismaFeatureUsageAction;
    ts: Date;
    metadata?: unknown;
  };
};

type FeatureUsageGroupByArgs = {
  by: ['featureId'];
  where: { userId: string; tenantId?: string };
  _count: { _all: true };
};

type PrismaClientLike = {
  featureUsage: {
    create(args: FeatureUsageCreateArgs): Promise<unknown>;
    groupBy(args: FeatureUsageGroupByArgs | unknown): Promise<FeatureUsageRow[]>;
  };
};

type PrismaClientModule = {
  PrismaClient?: new () => PrismaClientLike;
  default?: { PrismaClient?: new () => PrismaClientLike };
};

type PrismaTelemetryStorage = TelemetryStorage & {
  aggregateFeatureUseCount: (userId: string, tenantId?: string) => Promise<Record<string, number>>;
};

let cachedClient: Promise<PrismaClientLike> | null = null;

async function loadDefaultClient(): Promise<PrismaClientLike> {
  if (!cachedClient) {
    cachedClient = import('@prisma/client')
      .then((mod: PrismaClientModule) => {
        const prismaCtor =
          typeof mod?.PrismaClient === 'function'
            ? mod.PrismaClient
            : typeof mod?.default?.PrismaClient === 'function'
              ? mod.default.PrismaClient
              : null;
        if (!prismaCtor) {
          throw new Error('PrismaClient is not available. Install @prisma/client to use Prisma storage.');
        }
        return new prismaCtor();
      })
      .catch((error) => {
        cachedClient = null;
        throw error;
      });
  }
  return cachedClient;
}

function buildStore(client: PrismaClientLike): PrismaTelemetryStorage {
  const storage: PrismaTelemetryStorage = {
    async record(ev: TelemetryEvent): Promise<void> {
      await client.featureUsage.create({
        data: {
          userId: ev.userId,
          tenantId: ev.tenantId,
          featureId: ev.featureId,
          action: toAction(ev.action),
          ts: new Date(),
          metadata: toPrismaJson(ev.metadata),
        },
      });
    },
    async aggregateFeatureUseCount(userId: string, tenantId?: string) {
      const groupByArgs: FeatureUsageGroupByArgs = {
        by: ['featureId'],
        where: {
          userId,
          ...(tenantId ? { tenantId } : {}),
        },
        _count: { _all: true },
      };

      const rows = (await client.featureUsage.groupBy(groupByArgs)) as FeatureUsageRow[];

      const result = rows.reduce<Record<string, number>>((acc, row) => {
        const count = row._count;
        const total =
          typeof count === 'object' && count
            ? count._all ?? 0
            : typeof count === 'number'
              ? count
              : 0;
        acc[row.featureId] = total;
        return acc;
      }, {});

      return result;
    },
  };

  return storage;
}

const toAction = (input: string): PrismaFeatureUsageAction => {
  const value = input?.toLowerCase?.() ?? '';
  if (value === 'open' || value === 'view' || value === 'start') return 'open';
  if (value === 'complete' || value === 'finish') return 'complete';
  if (value === 'dismiss' || value === 'error' || value === 'cancel') return 'dismiss';
  return 'open';
};

export function createPrismaTelemetryStorage(client?: PrismaClientLike): PrismaTelemetryStorage {
  if (client) {
    return buildStore(client);
  }

  let storePromise: Promise<PrismaTelemetryStorage> | null = null;

  const ensureStore = async () => {
    if (!storePromise) {
      storePromise = loadDefaultClient().then((resolved) => buildStore(resolved));
    }
    return storePromise;
  };

  const storage: PrismaTelemetryStorage = {
    async record(ev: TelemetryEvent): Promise<void> {
      const store = await ensureStore();
      await store.record(ev);
    },
    async aggregateFeatureUseCount(userId: string, tenantId?: string) {
      const store = await ensureStore();
      return store.aggregateFeatureUseCount(userId, tenantId);
    },
  };

  return storage;
}
