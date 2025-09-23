import { describe, expect, it, beforeEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import NaviGrid from "./NaviGrid";
import { settingsStore } from "@/store/settings";

describe("NaviGrid feature flags", () => {
  beforeEach(() => {
    settingsStore.reset();
  });

  it("hides integration tiles when flags disabled", () => {
    const html = renderToStaticMarkup(<NaviGrid />);
    expect(html).not.toContain('data-integration-card="collab"');
    expect(html).not.toContain('data-integration-card="gws"');
    expect(html).not.toContain('data-integration-card="visma"');
  });

  it("shows integration tiles when flags enabled", () => {
    settingsStore.set("enableCollabPanel", true);
    settingsStore.set("enableGwsPanel", true);
    settingsStore.set("enableVismaPanel", true);
    const html = renderToStaticMarkup(<NaviGrid />);
    expect(html).toContain('data-integration-card="collab"');
    expect(html).toContain('data-integration-card="gws"');
    expect(html).toContain('data-integration-card="visma"');
  });
});
