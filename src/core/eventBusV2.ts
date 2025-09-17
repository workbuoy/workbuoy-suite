// src/core/eventBusV2.ts
// Single-surface event bus facade used by ALL imports.
// Re-exports the shared PriorityEventBus instance from ./events/bus
// and keeps legacy publish/subscribe aliases for compatibility.

import type { WorkbuoyEvent } from './events/bus';

export type Priority = 'high' | 'med' | 'low';

export type PriorityStatsName = 'high' | 'medium' | 'low' | 'med';

export interface PriorityBusStats {
  summary: { high: number; medium: number; low: number; dlq: number };
  queues: Array<{ name: PriorityStatsName; size: number; events?: WorkbuoyEvent[] }>;
  dlq: WorkbuoyEvent[];
}

export interface PriorityBus {
  emit<T>(
    type: string,
    payload: T,
    opts?: { priority?: Priority; idempotencyKey?: string }
  ): Promise<void>;
  on(type: string, handler: (payload: any) => Promise<void> | void): void;
  stats(): Promise<PriorityBusStats>;

  // Compat helpers – kept for existing call sites
  publish?: PriorityBus['emit'];
  subscribe?: PriorityBus['on'];

  // Introspection helpers (optional on impl)
  reset?: () => void;
  _peek?: () => any;
}

// Import the concrete shared instance
import PriorityBusImpl from './events/bus';

// Export the instance as the canonical bus
export const bus: PriorityBus = PriorityBusImpl as unknown as PriorityBus;

// Back-compat aliases (publish/subscribe) mapped to emit/on
(bus as any).publish = bus.emit.bind(bus);
(bus as any).subscribe = bus.on.bind(bus);

// Default export for consumers using `import bus from ...`
export default bus;
