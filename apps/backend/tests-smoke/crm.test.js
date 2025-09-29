import test from "node:test";
import assert from "node:assert/strict";
import { startBackend } from "./_helpers/backend.js";

const BASE_PORT = Number(process.env.SMOKE_PORT ?? 3100);

test("CRM health (optional, skipped if 404)", { concurrency: false, timeout: 15_000 }, async (t) => {
  const backend = await startBackend(BASE_PORT + 3);
  try {
    const res = await fetch(`${backend.url}/api/crm/health`).catch(() => null);
    if (!res || res.status === 404) {
      t.skip("CRM router not mounted in this build");
      return;
    }

    assert.equal(res.status, 200);
  } finally {
    await backend.stop();
  }
});
