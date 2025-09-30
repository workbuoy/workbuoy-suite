import {
  createInMemoryTelemetryStorage,
  createPrismaTelemetryStorage,
} from '@workbuoy/backend-telemetry';
import type { TelemetryStorage } from '@workbuoy/backend-telemetry';
import { prisma } from './db/prisma.js';
import { emitMetricsEvent } from './metrics/events.js';

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
    if (typeof value === 'function') {
      wrapped[key] = (value as (...args: any[]) => unknown).bind(store);
    } else {
      wrapped[key] = value;
    }
  }

  return wrapped as T;
}

const fallbackStorage = wrapTelemetryStore(createInMemoryTelemetryStorage());
let persistentStorage: TelemetryStorage | null = null;

export function getTelemetryFallbackStore(): TelemetryStorage {
  return fallbackStorage;
}

export function ensureTelemetryPersistentStore(): TelemetryStorage {
  if (!persistentStorage) {
    persistentStorage = wrapTelemetryStore(createPrismaTelemetryStorage(prisma));
  }
  return persistentStorage;
}
