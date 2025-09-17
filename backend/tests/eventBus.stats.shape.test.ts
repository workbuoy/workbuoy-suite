import bus, { reset } from "../../src/core/events/priorityBus";

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
});
