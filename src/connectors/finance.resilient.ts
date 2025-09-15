import type { FinanceConnector, FinanceAction } from './finance';
import { CircuitBreaker } from '../core/circuit';

export class ResilientFinanceConnector implements FinanceConnector {
  constructor(private inner: FinanceConnector, private breaker = new CircuitBreaker()) {}

  async health(): Promise<boolean> {
    try {
      return await this.breaker.call('health', () => this.inner.health());
    } catch {
      return false;
    }
  }

  async dryRun(action: FinanceAction, payload: any) {
    return this.breaker.call('dryRun', () => this.inner.dryRun(action, payload));
  }

  async simulate(action: FinanceAction, payload: any) {
    return this.breaker.call('simulate', () => this.inner.simulate(action, payload));
  }

  async execute(action: FinanceAction, payload: any) {
    return this.breaker.call('execute', () => this.inner.execute(action, payload));
  }
}
