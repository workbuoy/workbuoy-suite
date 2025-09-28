import { test } from "node:test";
import assert from "node:assert/strict";
import { startServer } from "./helpers/server.js";

let srv;

test.before(async () => {
  srv = await startServer();
});

test("CRM health (optional, skipped if 404)", async (t) => {
  const res = await fetch(`${srv.baseUrl}/api/crm/health`).catch(() => null);
  if (!res || res.status === 404) {
    t.skip("CRM router not mounted in this build");
    return;
  }
  assert.equal(res.status, 200);
});
