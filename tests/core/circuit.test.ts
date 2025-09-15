import { CircuitBreaker } from '../../src/core/circuit';

describe('CircuitBreaker', () => {
  it('opens after threshold and then half-opens', async () => {
    const br = new CircuitBreaker({ failureThreshold: 2, halfOpenAfterMs: 10 });
    await expect(br.call('x', async () => { throw new Error('e1'); })).rejects.toThrow();
    await expect(br.call('x', async () => { throw new Error('e2'); })).rejects.toThrow();
    expect(br.getState()).toBe('open');
    const wait = (ms:number)=>new Promise(r=>setTimeout(r,ms));
    await wait(12);
    await expect(br.call('x', async () => 'ok')).resolves.toBe('ok');
    expect(br.getState()).toBe('closed');
  });
});
