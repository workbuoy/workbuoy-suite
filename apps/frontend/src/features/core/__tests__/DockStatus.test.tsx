import { describe, expect, it } from "vitest";
import { resolveDockStatus } from "../useDockStatus";

describe("resolveDockStatus", () => {
  it("returns thinking when buoy is typing regardless of status", () => {
    expect(resolveDockStatus(true, 200)).toBe("thinking");
    expect(resolveDockStatus(true, 500)).toBe("thinking");
  });

  it("returns error for network failures or server errors", () => {
    expect(resolveDockStatus(false, 0)).toBe("error");
    expect(resolveDockStatus(false, 503)).toBe("error");
  });

  it("returns warn for client errors", () => {
    expect(resolveDockStatus(false, 404)).toBe("warn");
  });

  it("returns ok for success responses or when no status available", () => {
    expect(resolveDockStatus(false, 200)).toBe("ok");
    expect(resolveDockStatus(false, null)).toBe("ok");
    expect(resolveDockStatus(false, 302)).toBe("ok");
  });
});
