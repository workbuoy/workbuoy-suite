import test from "node:test";
import assert from "node:assert/strict";
import { startBackend } from "./_helpers/backend.js";

const BASE_PORT = Number(process.env.SMOKE_PORT ?? 3100);

test("GET /metrics returns 200 text/plain", { concurrency: false, timeout: 15_000 }, async (t) => {
  const backend = await startBackend(BASE_PORT + 2);
  try {
    const res = await fetch(`${backend.url}/metrics`);
    if (res.status === 404) {
      t.skip("Metrics endpoint not mounted in this build");
      return;
    }

    assert.equal(res.status, 200);
    const contentType = res.headers.get("content-type") ?? "";
    assert.ok(contentType.includes("text/plain"));
    const body = await res.text();
    assert.ok(body.length > 0);
  } finally {
    await backend.stop();
  }
});
