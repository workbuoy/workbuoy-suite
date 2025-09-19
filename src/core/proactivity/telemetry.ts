import { modeToKey, ProactivityMode } from './modes';
import type { ProactivityState } from './context';

export interface ProactivityTelemetryEvent {
  ts: number;
  tenantId: string;
  userId?: string;
  requested: ProactivityMode;
  effective: ProactivityMode;
  basis: string[];
  source?: string;
  event: 'modusskift';
}

const events: ProactivityTelemetryEvent[] = [];
const MAX_EVENTS = 200;

export function logModusskift(state: ProactivityState, opts: { tenantId: string; userId?: string; source?: string }): void {
  const entry: ProactivityTelemetryEvent = {
    ts: Date.now(),
    tenantId: opts.tenantId,
    userId: opts.userId,
    requested: state.requested,
    effective: state.effective,
    basis: state.basis,
    source: opts.source,
    event: 'modusskift',
  };
  events.push(entry);
  if (events.length > MAX_EVENTS) {
    events.splice(0, events.length - MAX_EVENTS);
  }
}

export function getRecentProactivityEvents(limit = 10): (ProactivityTelemetryEvent & { requestedKey: string; effectiveKey: string })[] {
  return events
    .slice(-limit)
    .reverse()
    .map(event => ({
      ...event,
      requestedKey: modeToKey(event.requested),
      effectiveKey: modeToKey(event.effective),
    }));
}

export function resetProactivityTelemetry() {
  events.splice(0, events.length);
}

export function getTelemetryEventCount() {
  return events.length;
}
