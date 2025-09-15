type State = 'closed'|'open'|'half-open';

interface Bucket {
  state: State;
  failures: number;
  lastOpenedAt: number;
}

export interface CircuitOptions {
  failureThreshold?: number; // consecutive failures before open
  cooldownMs?: number;       // how long to stay open
}

const DEFAULTS: Required<CircuitOptions> = { failureThreshold: 3, cooldownMs: 30000 };

const buckets: Record<string, Bucket> = {};

export class CircuitBreaker {
  private opts: Required<CircuitOptions>;
  constructor(opts?: CircuitOptions) { this.opts = { ...DEFAULTS, ...(opts||{}) }; }

  private getBucket(key:string): Bucket {
    return buckets[key] ||= { state:'closed', failures:0, lastOpenedAt:0 };
  }

  isOpen(key:string): boolean {
    const b = this.getBucket(key);
    if (b.state === 'open' && (Date.now() - b.lastOpenedAt) > this.opts.cooldownMs) {
      b.state = 'half-open'; // allow a trial
    }
    return b.state === 'open';
  }

  async exec<T>(key:string, fn:()=>Promise<T>): Promise<T> {
    const b = this.getBucket(key);
    if (this.isOpen(key)) throw new Error('circuit_open');

    try {
      const res = await fn();
      // success path
      b.failures = 0;
      b.state = 'closed';
      return res;
    } catch (e) {
      b.failures += 1;
      if (b.failures >= this.opts.failureThreshold) {
        b.state = 'open';
        b.lastOpenedAt = Date.now();
      }
      throw e;
    }
  }
}
