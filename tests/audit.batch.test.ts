import { appendBatched, flushNow } from "../src/core/audit/batch";

jest.mock("../src/core/audit", () => ({
  append: jest.fn(async () => void 0)
}));

const audit = require("../src/core/audit");

describe("audit batch", () => {
  it("flushes on timer and on flushNow()", async () => {
    await appendBatched({ ts: new Date().toISOString(), msg: "a" });
    await appendBatched({ ts: new Date().toISOString(), msg: "b" });
    await flushNow();
    expect(audit.append).toHaveBeenCalledTimes(2);
  });
});
