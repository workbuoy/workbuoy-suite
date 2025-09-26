import {
  createInMemoryTelemetryStorage,
  createPrismaTelemetryStorage,
} from '@workbuoy/backend-telemetry';
import type { TelemetryStorage } from '@workbuoy/backend-telemetry';
import { prisma } from '../../../src/core/db/prisma.js';

const fallbackStorage = createInMemoryTelemetryStorage();
let persistentStorage: TelemetryStorage | null = null;

export function getTelemetryFallbackStore(): TelemetryStorage {
  return fallbackStorage;
}

export function ensureTelemetryPersistentStore(): TelemetryStorage {
  if (!persistentStorage) {
    persistentStorage = createPrismaTelemetryStorage(prisma);
  }
  return persistentStorage;
}
