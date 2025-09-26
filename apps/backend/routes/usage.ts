import { createTelemetryRouter } from '@workbuoy/backend-telemetry';
import { envBool } from '../../../src/core/env.js';
import { getTelemetryFallbackStore, ensureTelemetryPersistentStore } from '../src/telemetryContext.js';

const usePersistence = envBool('FF_PERSISTENCE', false);

const router = createTelemetryRouter({
  usePersistence,
  defaultTenantId: 'DEV',
  fallbackStore: getTelemetryFallbackStore(),
  getPersistentStore: () => ensureTelemetryPersistentStore(),
});

export default router;
