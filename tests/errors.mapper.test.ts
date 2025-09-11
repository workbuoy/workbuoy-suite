import { AppError, toHttp } from "../src/core/errors/AppError";

describe("AppError mapper", () => {
  it("maps known error", () => {
    const err = new AppError("E_VALIDATION","bad",400,{ field:"name" });
    const out = toHttp(err);
    expect(out.status).toBe(400);
    expect(out.body.error).toBe("E_VALIDATION");
  });
  it("maps unknown error", () => {
    const out = toHttp(new Error("oops"));
    expect(out.status).toBe(500);
    expect(out.body.error).toBe("E_UNKNOWN");
  });
});
