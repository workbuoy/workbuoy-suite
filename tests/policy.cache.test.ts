import { get, put, clear, setTTL, setVersion } from "../src/core/policy/cache";

describe("policy cache", () => {
  beforeEach(() => { clear(); setTTL(1); setVersion("vX"); });
  it("caches and returns within TTL", () => {
    put({ role:"admin", auto:2, cat:"write", risk:"low", action:"create" }, { allow:true });
    const v = get({ role:"admin", auto:2, cat:"write", risk:"low", action:"create" });
    expect(v?.allow).toBe(true);
  });
  it("expires after TTL", async () => {
    setTTL(0);
    put({ role:"viewer", auto:0, cat:"read", risk:"low", action:"get" }, { allow:true });
    const v = get({ role:"viewer", auto:0, cat:"read", risk:"low", action:"get" });
    expect(v).toBeNull();
  });
});
