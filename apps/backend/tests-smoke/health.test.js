import { test } from "node:test";
import assert from "node:assert/strict";
import { startServer } from "./helpers/server.js";

let srv;

test.before(async () => {
  srv = await startServer();
});

test("GET /api/health returns 200", async () => {
  const res = await fetch(`${srv.baseUrl}/api/health`);
  assert.equal(res.status, 200);
  const payload = await res.json();
  assert.equal(payload.status ?? payload.ok, true);
});
