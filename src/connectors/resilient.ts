import type { FinanceConnector } from './finance';
import { CircuitBreaker } from '../core/circuit';

/**
 * Wrap a FinanceConnector with a circuit breaker.
 * When the breaker is open, calls throw 'circuit_open' error quickly.
 */
export function makeResilientFinance(
  impl: FinanceConnector,
  opts: { breaker?: CircuitBreaker, key?: string } = {}
): FinanceConnector {
  const breaker = opts.breaker || new CircuitBreaker();
  const key = opts.key || 'finance';

  return {
    async health(){ 
      try { return await breaker.exec(`${key}:health`, () => impl.health()); }
      catch { return false; }
    },
    async dryRun(action, payload){
      return breaker.exec(`${key}:dryRun`, () => impl.dryRun(action, payload));
    },
    async simulate(action, payload){
      return breaker.exec(`${key}:simulate`, () => impl.simulate(action, payload));
    },
    async execute(action, payload){
      return breaker.exec(`${key}:execute`, () => impl.execute(action, payload));
    }
  };
}
