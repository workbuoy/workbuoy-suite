import test from "node:test";

import "./health.test.js";
import "./version.test.js";
import "./metrics.test.js";
import "./crm.test.js";

test("smoke suite loader", () => {
  // This file ensures the other smoke tests are discoverable when running `node --test ./tests-smoke`.
});
