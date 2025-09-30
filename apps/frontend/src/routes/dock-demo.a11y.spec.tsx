import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { axe } from "../test-utils/axe";
import DockDemo from "./dock-demo";

describe("Dock demo accessibility axe audit", () => {
  it("renders the collapsed DockDemo without axe violations", async () => {
    const { container } = render(<DockDemo />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
