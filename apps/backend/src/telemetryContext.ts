import { createInMemoryTelemetryStore, createPrismaTelemetryStore } from '@workbuoy/backend-telemetry';
import type { TelemetryStore } from '@workbuoy/backend-telemetry';
import { prisma } from '../../../src/core/db/prisma.js';

const fallbackStore = createInMemoryTelemetryStore();
let persistentStore: TelemetryStore | null = null;

export function getTelemetryFallbackStore(): TelemetryStore {
  return fallbackStore;
}

export function ensureTelemetryPersistentStore(): TelemetryStore {
  if (!persistentStore) {
    persistentStore = createPrismaTelemetryStore(prisma);
  }
  return persistentStore;
}
