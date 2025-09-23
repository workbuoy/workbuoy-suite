import { describe, expect, test } from "vitest";
import { listKnownRoles, resolveRolePresentation } from "./rolePresentation";

describe("rolePresentation", () => {
  test("returns presentation for known role", () => {
    const presentation = resolveRolePresentation("sales_manager");
    expect(presentation.title).toBe("Sales Manager");
    expect(presentation.policyChips).toContain("Requires approval before auto-execute");
    expect(presentation.priorityHints.length).toBeGreaterThan(0);
  });

  test("falls back to default for unknown role", () => {
    const presentation = resolveRolePresentation("unknown_role");
    expect(presentation.id).toBe("ops");
    expect(presentation.tagline).toMatch(/Buoy AI/i);
  });

  test("all known roles include suggested entities", () => {
    for (const role of listKnownRoles()) {
      const presentation = resolveRolePresentation(role);
      expect(presentation.suggestedEntities.length).toBeGreaterThan(0);
    }
  });
});
