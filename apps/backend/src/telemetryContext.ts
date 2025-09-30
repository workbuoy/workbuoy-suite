import {
  createInMemoryTelemetryStorage,
  createPrismaTelemetryStorage,
} from '@workbuoy/backend-telemetry';
import type { TelemetryStorage } from '@workbuoy/backend-telemetry';
import { envBool, envStr } from '../../../src/core/env.js';
import { prisma } from '../../../src/core/db/prisma.js';
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

const persistenceFlagEnabled = envBool('FF_PERSISTENCE', false);
const hasDatabaseUrl = envStr('DATABASE_URL', '').trim().length > 0;
const telemetryPersistenceEnabled = persistenceFlagEnabled && hasDatabaseUrl;

export function isTelemetryPersistenceEnabled(): boolean {
  return telemetryPersistenceEnabled;
}

export function getTelemetryFallbackStore(): TelemetryStorage {
  return fallbackStorage;
}

export function ensureTelemetryPersistentStore(): TelemetryStorage {
  if (!telemetryPersistenceEnabled) {
    throw new Error('Telemetry persistence is disabled');
  }
  if (!persistentStorage) {
    persistentStorage = wrapTelemetryStore(createPrismaTelemetryStorage(prisma));
  }
  return persistentStorage;
}

export function resolveTelemetryStore(): TelemetryStorage {
  return telemetryPersistenceEnabled ? ensureTelemetryPersistentStore() : fallbackStorage;
}
