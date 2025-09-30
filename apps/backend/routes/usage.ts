import { createTelemetryRouter } from '@workbuoy/backend-telemetry';
import { getTelemetryFallbackStore, ensureTelemetryPersistentStore, isTelemetryPersistenceEnabled } from '../src/telemetryContext.js';

const usePersistence = isTelemetryPersistenceEnabled();

const router = createTelemetryRouter({
  usePersistence,
  defaultTenantId: 'DEV',
  fallbackStore: getTelemetryFallbackStore(),
  getPersistentStore: () => ensureTelemetryPersistentStore(),
});

export default router;
