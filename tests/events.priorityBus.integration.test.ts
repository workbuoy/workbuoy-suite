import bus from "../src/core/events/priorityBus";

function sleep(ms:number){ return new Promise(r=>setTimeout(r,ms)); }

describe("priorityBus integration", () => {
  it("emits high before low; failing handler retries then DLQs", async () => {
    const seen:string[] = [];
    // Clean subscribe space by using unique event names per test run
    const uid = Math.random().toString(36).slice(2);
    const OK = "ok-"+uid;
    const FAIL = "fail-"+uid;

    bus.subscribe(OK, (e)=>{ seen.push(e.priority || "low"); });
    let calls = 0;
    bus.subscribe(FAIL, (_e)=>{ calls++; throw new Error("boom"); });

    bus.emit({ type: OK, priority: "low" });
    bus.emit({ type: OK, priority: "high" });
    bus.emit({ type: FAIL, priority: "high" });

    await sleep(80);
    expect(seen[0]).toBe("high");
    expect(seen[1]).toBe("low");

    const peek = bus._peek();
    expect(peek.sizes.dlq).toBeGreaterThanOrEqual(1);
    expect(calls).toBeGreaterThanOrEqual(Number(process.env.BUS_MAX_ATTEMPTS || 3));
  }, 10000);
});
