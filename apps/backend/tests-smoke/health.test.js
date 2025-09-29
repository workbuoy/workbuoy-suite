import test from "node:test";
import assert from "node:assert/strict";
import { startBackend } from "./_helpers/backend.js";

const BASE_PORT = Number(process.env.SMOKE_PORT ?? 3100);

test("GET /api/health returns 200", { concurrency: false, timeout: 15_000 }, async (t) => {
  const backend = await startBackend(BASE_PORT);
  t.after(async () => {
    await backend.stop();
  });

  const res = await fetch(`${backend.url}/api/health`);
  assert.equal(res.status, 200);
  const payload = await res.json();
  assert.equal(payload.status ?? payload.ok, true);
});
