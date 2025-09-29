import test from "node:test";
import assert from "node:assert/strict";
import { startBackend } from "./_helpers/backend.js";

const BASE_PORT = Number(process.env.SMOKE_PORT ?? 3100);

test("GET /api/version returns { version, sha }", { concurrency: false, timeout: 15_000 }, async (t) => {
  const backend = await startBackend(BASE_PORT + 1);
  t.after(async () => {
    await backend.stop();
  });

  const res = await fetch(`${backend.url}/api/version`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(Object.hasOwn(data, "version"), "missing version");
  assert.ok(Object.hasOwn(data, "sha"), "missing sha");
});
