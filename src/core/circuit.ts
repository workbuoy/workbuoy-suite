export type CircuitState = 'closed'|'open'|'half-open';

export interface CircuitOptions {
  failureThreshold?: number;
  halfOpenAfterMs?: number;
  resetTimeoutMs?: number;
}

export class CircuitBreaker {
  private state: CircuitState = 'closed';
  private failures = 0;
  private lastOpenedAt = 0;

  constructor(private opts: CircuitOptions = {}) {}

  isOpen(now = Date.now()): boolean {
    if (this.state === 'open') {
      const wait = this.opts.halfOpenAfterMs ?? 10000;
      if ((now - this.lastOpenedAt) >= wait) {
        this.state = 'half-open';
        return false;
      }
      return true;
    }
    return false;
  }

  async call<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    if (this.isOpen(now)) throw new Error(`circuit_open:${name}`);

    try {
      const res = await fn();
      this.onSuccess();
      return res;
    } catch (e) {
      this.onFailure();
      throw e;
    }
  }

  onSuccess() {
    if (this.state === 'half-open') {
      this.state = 'closed';
      this.failures = 0;
      return;
    }
    if (this.state === 'closed') {
      this.failures = 0;
    }
  }

  onFailure() {
    const threshold = this.opts.failureThreshold ?? 3;
    if (this.state === 'half-open') {
      this.open();
      return;
    }
    this.failures += 1;
    if (this.failures >= threshold) this.open();
  }

  private open() {
    this.state = 'open';
    this.lastOpenedAt = Date.now();
  }

  getState(): CircuitState {
    return this.state;
  }

  getFailures(): number {
    return this.failures;
  }
}
