import { CircuitBreaker } from '../../src/core/circuit';

describe('CircuitBreaker', () => {
  it('opens after threshold and recovers after cooldown', async () => {
    const cb = new CircuitBreaker({ failureThreshold: 2, cooldownMs: 50 });
    // fail twice
    await expect(cb.exec('k', async () => { throw new Error('x'); })).rejects.toThrow();
    await expect(cb.exec('k', async () => { throw new Error('x'); })).rejects.toThrow();
    // now open
    await expect(cb.exec('k', async () => Promise.resolve('ok'))).rejects.toThrow('circuit_open');
    // wait cooldown
    await new Promise(r => setTimeout(r, 60));
    // half-open -> allow one try; success closes
    const res = await cb.exec('k', async () => 'ok');
    expect(res).toBe('ok');
    // next call should stay closed
    const res2 = await cb.exec('k', async () => 'ok2');
    expect(res2).toBe('ok2');
  });
});
