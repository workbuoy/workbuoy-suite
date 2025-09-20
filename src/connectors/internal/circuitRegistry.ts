import { CircuitBreaker, CircuitOptions, CircuitState } from '../../core/circuit';

const breakers = new Map<string, CircuitBreaker>();

const DEFAULT_OPTIONS: CircuitOptions = {
  failureThreshold: 4,
  halfOpenAfterMs: 10_000,
  failureWindowMs: 60_000,
};

export function getConnectorCircuit(connector: string, opts?: CircuitOptions): CircuitBreaker {
  const existing = breakers.get(connector);
  if (existing) return existing;
  const breaker = new CircuitBreaker({ ...DEFAULT_OPTIONS, ...(opts ?? {}) });
  breakers.set(connector, breaker);
  return breaker;
}

export function getConnectorCircuitState(connector: string): CircuitState | undefined {
  return breakers.get(connector)?.getState();
}

export function listConnectorCircuits(): Array<{ connector: string; state: CircuitState }> {
  return Array.from(breakers.entries()).map(([connector, breaker]) => ({ connector, state: breaker.getState() }));
}

export function resetConnectorCircuits() {
  breakers.clear();
}
