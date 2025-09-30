import type { Router } from 'express';
import {
  createInMemoryTelemetryStorage,
  createPrismaTelemetryStorage,
  createTelemetryRouter,
  type TelemetryStorage,
} from '@workbuoy/backend-telemetry';
import { emitMetricsEvent } from '../metrics/events.js';
import { prisma } from '../../../../src/core/db/prisma.js';

const usePersist =
  (process.env.FF_PERSISTENCE ?? '0') === '1' && typeof process.env.DATABASE_URL === 'string' && process.env.DATABASE_URL.length > 0;

function wrapTelemetryStore<T extends TelemetryStorage>(store: T): T {
  const wrapped: TelemetryStorage & Record<string, unknown> = {
    async record(event) {
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
    wrapped[key] = typeof value === 'function' ? (value as (...args: any[]) => unknown).bind(store) : value;
  }

  return wrapped as T;
}

const fallbackStorage = wrapTelemetryStore(createInMemoryTelemetryStorage());
const persistentStorage = usePersist ? wrapTelemetryStore(createPrismaTelemetryStorage(prisma)) : null;

export const telemetryStorage: TelemetryStorage = persistentStorage ?? fallbackStorage;

export const telemetryRouter: Router = createTelemetryRouter({
  usePersistence: usePersist,
  defaultTenantId: 'DEV',
  fallbackStore: fallbackStorage,
  getPersistentStore: () => persistentStorage ?? fallbackStorage,
});

export function isTelemetryPersistenceEnabled(): boolean {
  return usePersist;
}
