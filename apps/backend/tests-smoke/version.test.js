import { test } from "node:test";
import assert from "node:assert/strict";
import { startServer } from "./helpers/server.js";

let srv;

test.before(async () => {
  srv = await startServer();
});

test("GET /api/version returns { version, sha }", async () => {
  const res = await fetch(`${srv.baseUrl}/api/version`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(Object.hasOwn(data, "version"), "missing version");
  assert.ok(Object.hasOwn(data, "sha"), "missing sha");
});
