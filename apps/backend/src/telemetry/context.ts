import type { Router } from 'express';
import {
  createInMemoryTelemetryStorage,
  createPrismaTelemetryStorage,
  createTelemetryRouter,
  type TelemetryEvent,
  type TelemetryStorage,
} from '@workbuoy/backend-telemetry';

import { emitMetricsEvent } from '../metrics/events.js';

const usePersist =
  (process.env.FF_PERSISTENCE ?? '0') === '1' &&
  typeof process.env.DATABASE_URL === 'string' &&
  process.env.DATABASE_URL.length > 0;

function wrapTelemetryStore<T extends TelemetryStorage>(store: T): T {
  const wrapped: TelemetryStorage & Record<string, unknown> = {
    async record(event: TelemetryEvent) {
      emitMetricsEvent('telemetry:feature_used', {
        feature: event.featureId,
        action: event.action,
      });
      await store.record(event);
    },
  };

  for (const key of Object.keys(store as Record<string, unknown>)) {
    if (key === 'record') {
      continue;
    }
    const value = (store as Record<string, unknown>)[key];
    wrapped[key] =
      typeof value === 'function' ? (value as (...args: unknown[]) => unknown).bind(store) : value;
  }

  return wrapped as T;
}

type PrismaModule = { prisma?: unknown; default?: unknown };

async function loadPrismaClient(): Promise<Parameters<typeof createPrismaTelemetryStorage>[0]> {
  const fallbackTsPath = '../../../../src/core/db/prisma.' + 'ts';

  const module = (await import('../../../../src/core/db/prisma.js').catch(async (error: unknown) => {
    const err = error as NodeJS.ErrnoException;
    if (err?.code === 'ERR_MODULE_NOT_FOUND') {
      return import(fallbackTsPath);
    }
    if (err instanceof SyntaxError || /does not provide an export/i.test(err?.message ?? '')) {
      return import(fallbackTsPath);
    }
    throw error;
  })) as PrismaModule;

  const candidate =
    (module.prisma as Parameters<typeof createPrismaTelemetryStorage>[0] | undefined) ??
    ((module.default as PrismaModule | undefined)?.prisma as
      | Parameters<typeof createPrismaTelemetryStorage>[0]
      | undefined) ??
    (module.default as Parameters<typeof createPrismaTelemetryStorage>[0] | undefined);

  if (!candidate) {
    throw new Error('Missing prisma export from core/db/prisma');
  }

  return candidate;
}

let persistentStorage: TelemetryStorage | null = null;

async function ensurePersistentStorage(): Promise<TelemetryStorage | null> {
  if (!usePersist) {
    return null;
  }
  if (!persistentStorage) {
    const prismaClient = await loadPrismaClient();
    persistentStorage = wrapTelemetryStore(createPrismaTelemetryStorage(prismaClient));
  }
  return persistentStorage;
}

const fallbackStorage = wrapTelemetryStore(createInMemoryTelemetryStorage());
const eagerlyResolvedPersistentStore = usePersist ? await ensurePersistentStorage() : null;

export const telemetryStorage: TelemetryStorage = eagerlyResolvedPersistentStore ?? fallbackStorage;

export const telemetryRouter: Router = createTelemetryRouter({
  usePersistence: usePersist,
  defaultTenantId: 'DEV',
  fallbackStore: fallbackStorage,
  getPersistentStore: () => ensurePersistentStorage().then((store) => store ?? fallbackStorage),
});

export function isTelemetryPersistenceEnabled(): boolean {
  return usePersist;
}
