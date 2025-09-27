const busModule = require('@backend/core/events/priorityBus');
const bus = busModule.default || busModule;
const {
  reset,
  emit,
  publish,
  subscribe,
  on,
  stats: statsFn,
  dlqList,
  peek
} = busModule;

describe("priorityBus stats shape", () => {
  beforeEach(() => {
    reset();
  });

  it("exposes summary with queue and dlq details", async () => {
    const stats = await bus.stats();

    expect(stats.summary).toEqual(
      expect.objectContaining({
        high: expect.any(Number),
        medium: expect.any(Number),
        low: expect.any(Number),
        dlq: expect.any(Number)
      })
    );

    expect(Array.isArray(stats.queues)).toBe(true);
    expect(stats.queues.length).toBeGreaterThanOrEqual(3);
    for (const queue of stats.queues) {
      expect(queue).toEqual(
        expect.objectContaining({
          name: expect.any(String),
          size: expect.any(Number)
        })
      );
      expect(Array.isArray((queue as any).events)).toBe(true);
    }

    expect(Array.isArray(stats.dlq)).toBe(true);
  });

  it('processes events across priorities and surfaces retry behaviors', async () => {
    const deliveries: Array<{ type: string; priority: string }> = [];

    subscribe('metrics', (event: any) => {
      deliveries.push({ type: event.type, priority: event.priority });
    });

    on('mapped', (payload: any, event: any) => {
      deliveries.push({ type: event.type, priority: event.priority });
      expect(payload).toMatchObject({ sample: 'mapped' });
    });

    let failureCount = 0;
    subscribe('dlq', () => {
      failureCount += 1;
      throw new Error('boom');
    });

    await emit('metrics', { sample: true }, {
      priority: 'urgent',
      correlationId: 'corr-1',
      source: 'jest',
      headers: { foo: 'bar' },
      meta: { suite: 'events' }
    });

    await emit({ type: 'metrics', priority: 'low', payload: { sample: false }, id: 'evt-123' });

    await publish({ type: 'mapped', priority: 'minor', payload: { sample: 'mapped' } });

    await publish({ type: 'dlq', payload: { id: '1' }, priority: 'low' });

    const { summary } = await statsFn();
    expect(summary).toEqual({ high: 0, medium: 0, low: 0, dlq: 1 });

    const dlq = dlqList();
    expect(dlq).toHaveLength(1);
    expect(dlq[0].retries).toBeGreaterThanOrEqual(3);
    expect(dlq[0].id).toEqual(expect.any(String));
    expect(dlq[0].lastError).toBe('boom');

    const view = peek();
    expect(view.sizes.dlq).toBe(1);
    expect(Array.isArray(view.queues.high)).toBe(true);

    expect(deliveries.some((entry) => entry.type === 'metrics')).toBe(true);
    expect(deliveries.some((entry) => entry.type === 'mapped')).toBe(true);
    expect(failureCount).toBeGreaterThanOrEqual(3);
  });
});
