import bus from "../src/core/events/priorityBus";
function sleep(ms:number){ return new Promise(r=>setTimeout(r,ms)); }

describe("priorityBus", () => {
  it("dispatches high before low and sends to DLQ after retries", async () => {
    const order: string[] = [];
    bus.subscribe("ok", (e)=>{ order.push("ok:"+e.priority); });
    let calls = 0;
    bus.subscribe("fail", (_e)=>{ calls++; throw new Error("boom"); });

    bus.emit({ type:"ok", priority:"low" });
    bus.emit({ type:"ok", priority:"high" });
    bus.emit({ type:"fail", priority:"high" });

    await sleep(50);
    const peek = bus._peek();
    expect(order[0]).toBe("ok:high");
    expect(order[1]).toBe("ok:low");
    expect(peek.sizes.dlq).toBeGreaterThanOrEqual(1);
    expect(calls).toBeGreaterThanOrEqual(3);
  }, 10000);
});
