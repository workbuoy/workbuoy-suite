import type { TelemetryEvent, TelemetryStorage } from '@workbuoy/backend-telemetry';
import {
  createInMemoryTelemetryStorage,
  createPrismaTelemetryStorage,
  createTelemetryRouter,
} from '@workbuoy/backend-telemetry';
import { emitMetricsEvent } from '../metrics/events.js';

const usePrisma =
  process.env.FF_PERSISTENCE === '1' || process.env.TELEMETRY_PERSIST === 'prisma';

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
      wrapped[key] = (value as (...args: unknown[]) => unknown).bind(store);
    } else {
      wrapped[key] = value;
    }
  }

  return wrapped as T;
}

const memoryStore = wrapTelemetryStore(createInMemoryTelemetryStorage());
let persistentStore: TelemetryStorage | null = null;

function ensurePersistentStore(): TelemetryStorage {
  if (!persistentStore) {
    persistentStore = wrapTelemetryStore(createPrismaTelemetryStorage());
  }
  return persistentStore;
}

export const telemetryMode = usePrisma ? 'prisma' : 'memory';

const activeStore: TelemetryStorage = usePrisma ? ensurePersistentStore() : memoryStore;

export const telemetryStore = activeStore;
export const telemetryRouter = createTelemetryRouter(activeStore);

export function getTelemetryFallbackStore(): TelemetryStorage {
  return memoryStore;
}

export function ensureTelemetryPersistentStore(): TelemetryStorage {
  return ensurePersistentStore();
}

export function recordTelemetry(event: TelemetryEvent) {
  void activeStore.record(event);
  // (Valgfritt) Hvis metrics-bro finnes: emit her også.
}
