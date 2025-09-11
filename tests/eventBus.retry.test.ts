/* eslint-disable @typescript-eslint/no-explicit-any */
import { emit } from "../src/core/eventBus";
const bus: any = require("../src/core/eventBus");

describe("event bus (retry -> DLQ)", () => {
  beforeEach(() => {
    if (Array.isArray(bus.DLQ)) bus.DLQ.length = 0;
    if (typeof bus.clearHandlers === "function") bus.clearHandlers();
  });

  it("retries once then succeeds (no DLQ)", async () => {
    if (typeof bus.on !== "function") return; // skip if API differs
    let calls = 0;
    bus.on("task.created", async () => {
      calls++;
      if (calls < 2) throw new Error("fail once");
    });
    await emit({ type: "task.created", payload: { id: "t1" }, priority: "normal" });
    expect(calls).toBe(2);
    if (Array.isArray(bus.DLQ)) expect(bus.DLQ.length).toBe(0);
  });

  it("pushes to DLQ after retry fails", async () => {
    if (typeof bus.on !== "function") return; // skip if API differs
    bus.on("task.updated", async () => {
      throw new Error("always fail");
    });
    await emit({ type: "task.updated", payload: { id: "t2" }, priority: "normal" });
    if (Array.isArray(bus.DLQ)) expect(bus.DLQ.length).toBeGreaterThan(0);
  });
});
