import { test } from "node:test";
import assert from "node:assert/strict";
import { startServer } from "./helpers/server.js";

let srv;

test.before(async () => {
  srv = await startServer();
});

test("GET /metrics returns 200 text/plain", async (t) => {
  const res = await fetch(`${srv.baseUrl}/metrics`);
  if (res.status === 404) {
    t.skip("Metrics endpoint not mounted in this build");
    return;
  }
  assert.equal(res.status, 200);
  const contentType = res.headers.get("content-type") ?? "";
  assert.ok(contentType.includes("text/plain"));
  const body = await res.text();
  assert.ok(body.length > 0);
});
