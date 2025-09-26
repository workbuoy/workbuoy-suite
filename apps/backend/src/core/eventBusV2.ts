/**
 * Backend-local shim for the shared event bus.
 *
 * Attempts to load the monorepo-level PriorityBus implementation using a NodeNext-compatible
 * specifier. When the shared bus is unavailable (e.g. isolated type-checks or container builds
 * without the root sources), we fall back to a lightweight local emitter that satisfies the
 * EventBus contract so the backend can still boot.
 */
import { EventEmitter } from 'events';
import { createRequire } from 'module';

import type {
  PriorityBus as EventBus,
  PriorityBusStats,
} from '../../../src/core/eventBusV2.js';

const require = createRequire(import.meta.url);

function createLocalBus(): EventBus {
  const emitter = new EventEmitter();

  const summary: PriorityBusStats['summary'] = {
    high: 0,
    medium: 0,
    low: 0,
    dlq: 0,
  };

  const localBus: Partial<EventBus> = {
    async emit(type, payload, _opts) {
      emitter.emit(type, payload);
    },
    on(type, handler) {
      emitter.on(type, (payload) => {
        void handler(payload);
      });
    },
    async stats() {
      return {
        summary,
        queues: [],
        dlq: [],
      } satisfies PriorityBusStats;
    },
    reset() {
      emitter.removeAllListeners();
    },
  };

  localBus.publish = localBus.emit as EventBus['publish'];
  localBus.subscribe = localBus.on as EventBus['subscribe'];

  return localBus as EventBus;
}

let sharedBus: EventBus | undefined;
try {
  // NodeNext requires explicit extensions for relative imports.
  sharedBus = require('../../../src/core/eventBusV2.js').bus as EventBus;
} catch {
  // Ignore resolution failures and fall back to the local shim.
}

export type { EventBus };

export const eventBus: EventBus = sharedBus ?? createLocalBus();
