import bus, { dlqList } from './priorityBus.js';

describe('priority bus edge cases', () => {
  beforeEach(() => {
    bus.reset();
  });

  afterEach(() => {
    bus.reset();
  });

  it('retries synchronous handler failures and eventually DLQs the event', async () => {
    const attempts: number[] = [];

    bus.subscribe('sync-error', (event) => {
      attempts.push(event.retries);
      throw new Error('boom');
    });

    await bus.emit({ type: 'sync-error', priority: 'high' });

    expect(attempts[0]).toBe(0);
    for (let i = 1; i < attempts.length; i += 1) {
      expect(attempts[i]).toBe(i);
    }

    const failures = dlqList();
    expect(failures).toHaveLength(1);
    const failure = failures[0]!;
    expect(failure.retries).toBe(attempts.length);
    expect(failure.lastError).toBe('boom');
  });

  it('retries rejected promises and succeeds without DLQ once the handler resolves', async () => {
    const attempts: number[] = [];
    let shouldFail = true;

    bus.subscribe('async-error', async (event) => {
      attempts.push(event.retries);
      if (shouldFail) {
        shouldFail = false;
        throw new Error('transient');
      }
    });

    await bus.emit({ type: 'async-error', priority: 'high' });

    expect(attempts).toEqual([0, 1]);
    expect(dlqList()).toHaveLength(0);
  });

  it('keeps listener order intact even when a handler fails before succeeding later', async () => {
    const seen: string[] = [];
    let firstShouldFail = true;

    bus.subscribe('ordered', 'first-listener', (event) => {
      seen.push(`first:${event.retries}`);
      if (firstShouldFail) {
        firstShouldFail = false;
        throw new Error('retry me');
      }
    });

    bus.subscribe('ordered', 'second-listener', (event) => {
      seen.push(`second:${event.retries}`);
    });

    await bus.publish({ type: 'ordered', priority: 'high', payload: { step: 1 } });

    expect(seen).toEqual(['first:0', 'second:0', 'first:1', 'second:1']);
    expect(dlqList()).toHaveLength(0);
  });
});
