import request from "supertest";
import app from "../src/server";
import { log } from "../src/core/logging/logger";
import { errorHandler } from "../src/core/middleware/errorHandler";
import { AppError } from "../src/core/errors";

describe("logging", () => {
  it("masks PII and includes correlationId", () => {
    const orig = console.log;
    const logs: string[] = [];
    console.log = (msg: string) => logs.push(msg);

    try {
      log(
        "info",
        "test",
        "creating user",
        { email: "a@x.com", nested: { phone: "123" } },
        "corr-1"
      );
    } finally {
      console.log = orig;
    }

    expect(logs.length).toBe(1);
    const entry = JSON.parse(logs[0]);
    expect(entry.correlationId).toBe("corr-1");
    expect(entry.metadata.email).toBe("***");
    expect(entry.metadata.nested.phone).toBe("***");
    expect(entry.piiMasked).toBe(true);
  });

  it("propagates correlationId from requests", async () => {
    const orig = console.log;
    const logs: string[] = [];
    console.log = (msg: string) => logs.push(msg);

    try {
      await request(app).get("/api/tasks").set("x-correlation-id", "corr-2");
    } finally {
      console.log = orig;
    }

    const entries = logs.map((l) => JSON.parse(l));
    const entry = entries.find((e) => e.component === "tasks.route");
    expect(entry?.correlationId).toBe("corr-2");
  });

  it("logs correlationId in errorHandler", () => {
    const orig = console.log;
    const logs: string[] = [];
    console.log = (msg: string) => logs.push(msg);

    const req: any = { correlationId: "err-1" };
    const res: any = { status: () => res, json: () => res };

    try {
      errorHandler(new AppError("error", 500, "E", { foo: "bar" }), req, res, () => {});
    } finally {
      console.log = orig;
    }

    const entry = JSON.parse(logs[0]);
    expect(entry.correlationId).toBe("err-1");
  });
});

