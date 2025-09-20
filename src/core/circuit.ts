export type CircuitState = 'closed' | 'open' | 'half-open';

export interface CircuitOptions {
  failureThreshold?: number;
  halfOpenAfterMs?: number;
  resetTimeoutMs?: number;
  failureWindowMs?: number;
}

export class CircuitBreaker {
  private state: CircuitState = 'closed';
  private failureTimestamps: number[] = [];
  private lastOpenedAt = 0;

  constructor(private opts: CircuitOptions = {}) {}

  private pruneFailures(now: number) {
    const windowMs = this.opts.failureWindowMs ?? 60_000;
    this.failureTimestamps = this.failureTimestamps.filter(ts => now - ts <= windowMs);
  }

  isOpen(now = Date.now()): boolean {
    if (this.state === 'open') {
      const wait = this.opts.halfOpenAfterMs ?? 10_000;
      if (now - this.lastOpenedAt >= wait) {
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
      this.onSuccess(now);
      return res;
    } catch (e) {
      this.onFailure(now);
      throw e;
    }
  }

  onSuccess(now = Date.now()) {
    if (this.state === 'half-open') {
      this.state = 'closed';
      this.failureTimestamps = [];
      return;
    }
    if (this.state === 'closed') {
      this.pruneFailures(now);
    }
  }

  onFailure(now = Date.now()) {
    const threshold = this.opts.failureThreshold ?? 3;
    this.failureTimestamps.push(now);
    this.pruneFailures(now);
    if (this.state === 'half-open') {
      this.open(now);
      return;
    }
    if (this.failureTimestamps.length >= threshold) {
      this.open(now);
    }
  }

  private open(now = Date.now()) {
    this.state = 'open';
    this.lastOpenedAt = now;
  }

  getState(): CircuitState {
    return this.state;
  }

  getFailures(): number {
    this.pruneFailures(Date.now());
    return this.failureTimestamps.length;
  }
}
